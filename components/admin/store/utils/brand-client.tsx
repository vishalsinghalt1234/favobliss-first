"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/admin/store/utils/header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BrandColumn, brandColumns } from "./columns";
import { DataTable } from "@/components/admin/store/utils/data-table";
import { ApiList } from "./api-list.";

interface BrandClientProps {
  data: BrandColumn[];
  initialRowCount: number;
}

export const BrandClient = ({ data, initialRowCount }: BrandClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchBrands = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "name")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/brands?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json(); 
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Brands"
          badge={initialRowCount.toString()}
          description="Brands for your store"
        />
        <Button onClick={() => router.push(`/admin/brands/create`)}>
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={brandColumns}
        data={data}
        searchKey="name"
        serverSide
        fetchData={fetchBrands}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for brands" />
      <ApiList entityName="brands" entityIdName="brandId" />
    </>
  );
};