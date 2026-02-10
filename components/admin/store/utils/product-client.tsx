"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ProductColumn, productColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface ProductClientProps {
  data: ProductColumn[];
  initialRowCount: number;
}

export const ProductClient = ({ data, initialRowCount }: ProductClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchProducts = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "name")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/products?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json(); // { rows: ProductColumn[], rowCount: number }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Products"
          badge={initialRowCount.toString()}
          description="Products for your store"
        />
        <Button onClick={() => router.push(`/admin/products/create`)}>
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={productColumns}
        data={data}
        visibility
        searchKey="name"
        serverSide
        fetchData={fetchProducts}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for products" />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};