"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Separator } from "@/components/ui/separator";
import { ReviewColumn, reviewColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface ReviewClientProps {
  data: ReviewColumn[];
  initialRowCount: number;
}

export const ReviewClient = ({ data, initialRowCount }: ReviewClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchReviews = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "productName")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/reviews?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json(); // { rows, rowCount }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Reviews"
          badge={initialRowCount.toString()}
          description="Manage reviews for your store's products"
        />
      </div>
      <Separator />
      <DataTable
        columns={reviewColumns}
        data={data}
        searchKey="productName"
        serverSide
        fetchData={fetchReviews}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for reviews" />
      <ApiList entityName="reviews" entityIdName="reviewId" />
    </>
  );
};