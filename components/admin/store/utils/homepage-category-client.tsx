"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { HomepageCategoryColumn, homepageCategoryColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface HomepageCategoryClientProps {
  data: HomepageCategoryColumn[];
  initialRowCount: number;
}

export const HomepageCategoryClient = ({
  data,
  initialRowCount,
}: HomepageCategoryClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchHomepageCategories = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "name")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/homepage-categories?page=${
      pageIndex + 1
    }&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch homepage categories");
    return res.json();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Homepage Categories"
          badge={initialRowCount.toString()}
          description="Homepage categories for your store"
        />
        <Button
          onClick={() => router.push(`/admin/homepage-categories/create`)}
        >
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={homepageCategoryColumns}
        data={data}
        searchKey="name"
        serverSide
        fetchData={fetchHomepageCategories}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for homepage categories" />
      <ApiList
        entityName="homepage-categories"
        entityIdName="homepageCategoryId"
      />
    </>
  );
};