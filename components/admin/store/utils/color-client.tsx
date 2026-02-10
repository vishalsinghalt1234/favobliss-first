"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ColorColumn, colorColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface ColorClientProps {
  data: ColorColumn[];
  initialRowCount: number;
}

export const ColorClient = ({ data, initialRowCount }: ColorClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchColors = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "name")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/colors?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch colors");
    return res.json(); // { rows: ColorColumn[], rowCount: number }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Colors"
          badge={initialRowCount.toString()}
          description="Colors for your store"
        />
        <Button onClick={() => router.push(`/admin/colors/create`)}>
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={colorColumns}
        data={data}
        searchKey="name"
        serverSide
        fetchData={fetchColors}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for colors" />
      <ApiList entityName="colors" entityIdName="colorId" />
    </>
  );
};