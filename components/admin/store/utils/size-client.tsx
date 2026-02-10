"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SizeColumn, sizeColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface SizeClientProps {
  data: SizeColumn[];
  initialRowCount: number;
}

export const SizeClient = ({ data, initialRowCount }: SizeClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchSizes = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "name")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/sizes?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch sizes");
    return res.json();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Sizes"
          badge={initialRowCount.toString()}
          description="Sizes for your store"
        />
        <Button onClick={() => router.push(`/admin/sizes/create`)}>
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={sizeColumns}
        data={data}
        searchKey="name"
        serverSide
        fetchData={fetchSizes}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for sizes" />
      <ApiList entityName="sizes" entityIdName="sizeId" />
    </>
  );
};