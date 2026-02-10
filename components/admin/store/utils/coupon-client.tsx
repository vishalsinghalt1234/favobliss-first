"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CouponColumn, couponColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface CouponClientProps {
  data: CouponColumn[];
  initialRowCount: number;
}

export const CouponClient = ({ data, initialRowCount }: CouponClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchCoupons = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "code")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/coupons?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch coupons");
    return res.json(); // { rows: CouponColumn[], rowCount: number }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Coupons"
          badge={initialRowCount.toString()}
          description="Manage coupons for your store"
        />
        <Button onClick={() => router.push(`/admin/coupons/create`)}>
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={couponColumns}
        data={data}
        searchKey="code"
        serverSide
        fetchData={fetchCoupons}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for coupons" />
      <ApiList entityName="coupons" entityIdName="couponId" />
    </>
  );
};