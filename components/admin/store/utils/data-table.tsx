"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ColumnDef,
  flexRender,
  ColumnFiltersState,
  getFilteredRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
  Updater,
  PaginationState,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/use-debouncecallback";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  visibility?: boolean;
  serverSide?: boolean;
  fetchData?: (options: {
    pageIndex: number;
    pageSize: number;
    filters: ColumnFiltersState;
  }) => Promise<{ rows: TData[]; rowCount: number }>;
  initialRowCount?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  searchKey,
  visibility,
  serverSide = false,
  fetchData,
  initialRowCount,
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialPageIndex = Math.max(
    0,
    parseInt(searchParams.get("page") ?? "1", 10) - 1,
  );
  const initialSearch = searchParams.get("q") ?? "";

  const [data, setData] = useState<TData[]>(initialData);
  const [rowCount, setRowCount] = useState(
    initialRowCount ?? initialData.length,
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialSearch ? [{ id: searchKey, value: initialSearch }] : [],
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [searchValue, setSearchValue] = useState<string>(initialSearch);

  const debouncedSetFilter = useDebouncedCallback((value: string) => {
    table.getColumn(searchKey)?.setFilterValue(value);
  }, 450);

  useEffect(() => {
    if (serverSide && fetchData) {
      fetchData({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        filters: columnFilters,
      })
        .then(({ rows, rowCount: newRowCount }) => {
          setData(rows);
          setRowCount(newRowCount);
          const newPageCount = Math.ceil(newRowCount / pagination.pageSize) || 1;
          if (pagination.pageIndex >= newPageCount) {
            setPagination((prev) => ({
              ...prev,
              pageIndex: newPageCount - 1,
            }));
          }
        })
        .catch((error) => console.error("Failed to fetch data:", error));
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    columnFilters,
    serverSide,
    fetchData,
  ]);

  useEffect(() => {
    if (!serverSide) {
      const pageCount = table.getPageCount();
      if (pagination.pageIndex >= pageCount && pageCount > 0) {
        setPagination((prev) => ({
          ...prev,
          pageIndex: pageCount - 1,
        }));
      }
    }
  }, [columnFilters, pagination.pageSize, serverSide]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (pagination.pageIndex + 1).toString());
    if (searchValue) {
      params.set("q", searchValue);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pagination.pageIndex, searchValue, pathname, router, searchParams]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (updater: Updater<PaginationState>) => {
      setPagination((old) =>
        typeof updater === "function" ? updater(old) : updater,
      );
    },
    ...(serverSide
      ? {
          manualPagination: true,
          rowCount,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  const pageCount = table.getPageCount();

  const displayPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const current = pagination.pageIndex + 1;

    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (current > 3) {
        pageNumbers.push("...");
      }
      const start = Math.max(2, current - 2);
      const end = Math.min(pageCount - 1, current + 2);
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      if (current < pageCount - 2) {
        pageNumbers.push("...");
      }
      pageNumbers.push(pageCount);
    }
    return pageNumbers;
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder={`Filter ${searchKey}...`}
          value={searchValue}
          onChange={(event) => {
            const value = event.target.value;
            setSearchValue(value);

            if (serverSide) {
              debouncedSetFilter(value);
            } else {
              table.getColumn(searchKey)?.setFilterValue(value);
            }
          }}
          className="max-w-sm"
        />
        {visibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        {displayPageNumbers().map((num, idx) =>
          typeof num === "string" ? (
            <span key={idx} className="flex items-center px-2">
              {num}
            </span>
          ) : (
            <Button
              key={idx}
              variant={pagination.pageIndex + 1 === num ? "default" : "outline"}
              size="sm"
              onClick={() => table.setPageIndex(num - 1)}
            >
              {num}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}