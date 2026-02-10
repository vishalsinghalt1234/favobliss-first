"use client";

import { useState, useEffect } from "react";

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
  const [data, setData] = useState<TData[]>(initialData);
  const [rowCount, setRowCount] = useState(
    initialRowCount ?? initialData.length,
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [searchValue, setSearchValue] = useState<string>("");

  const debouncedSetFilter = useDebouncedCallback((value: string) => {
    table.getColumn(searchKey)?.setFilterValue(value);
  }, 450);

  useEffect(() => {
    const filterVal =
      (table.getColumn(searchKey)?.getFilterValue() as string) ?? "";
    setSearchValue(filterVal);
  }, []);

  useEffect(() => {
    if (serverSide && fetchData) {
      fetchData({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        filters: columnFilters,
      })
        .then(({ rows, rowCount }) => {
          setData(rows);
          setRowCount(rowCount);
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(serverSide
      ? {
          manualPagination: true,
          rowCount,
          onPaginationChange: (updater: Updater<PaginationState>) => {
            setPagination((old) =>
              typeof updater === "function" ? updater(old) : updater,
            );
          },
          state: { pagination },
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
        }),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
      ...(serverSide ? { pagination } : {}),
    },
  });

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
