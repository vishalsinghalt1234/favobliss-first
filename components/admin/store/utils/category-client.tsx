"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CategoryColumn, categoryColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface CategoryClientProps {
  data: CategoryColumn[];
  initialRowCount: number;
}

export const CategoryClient = ({ data, initialRowCount }: CategoryClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchCategories = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "name")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/categories?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Categories"
          badge={initialRowCount.toString()}
          description="Categories for your store"
        />
        <Button onClick={() => router.push(`/admin/categories/create`)}>
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={categoryColumns}
        data={data}
        searchKey="name"
        serverSide
        fetchData={fetchCategories}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for categories" />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </>
  );
};