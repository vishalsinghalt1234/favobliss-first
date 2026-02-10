"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SubCategoryColumn, subCategoryColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface SubCategoryClientProps {
  data: SubCategoryColumn[];
  initialRowCount: number;
}

export const SubCategoryClient = ({ data, initialRowCount }: SubCategoryClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchSubCategories = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "name")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/subcategories?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch subcategories");
    return res.json(); // { rows: SubCategoryColumn[], rowCount: number }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Subcategories"
          badge={initialRowCount.toString()}
          description="Subcategories for your store"
        />
        <Button
          onClick={() => router.push(`/admin/subcategories/create`)}
        >
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={subCategoryColumns}
        data={data}
        searchKey="name"
        serverSide
        fetchData={fetchSubCategories}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for subcategories" />
      <ApiList entityName="subcategories" entityIdName="subCategoryId" />
    </>
  );
};