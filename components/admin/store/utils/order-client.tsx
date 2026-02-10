"use client";

import { useParams } from "next/navigation";

import { Header } from "./header";
import { Separator } from "@/components/ui/separator";
import { OrderColumn, orderColumns } from "./columns";
import { DataTable } from "./data-table";

interface OrderClientProps {
  data: OrderColumn[];
  initialRowCount: number;
}

export const OrderClient = ({ data, initialRowCount }: OrderClientProps) => {
  const params = useParams();

  const fetchOrders = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "orderNumber")
      ?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/orders?page=${
      pageIndex + 1
    }&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  };

  return (
    <>
      <Header
        title="Orders"
        badge={initialRowCount.toString()}
        description="Orders of your store"
      />
      <Separator />
      <DataTable
        columns={orderColumns}
        data={data}
        searchKey="orderNumber"
        serverSide
        fetchData={fetchOrders}
        initialRowCount={initialRowCount}
      />
    </>
  );
};