"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LocationColumn, locationColumns } from "./columns";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";

interface LocationClientProps {
  data: LocationColumn[];
  initialRowCount: number;
}

export const LocationClient = ({ data, initialRowCount }: LocationClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchLocations = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "city")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/location?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch locations");
    return res.json();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Locations"
          badge={initialRowCount.toString()}
          description="Locations for your store"
        />
        <Button onClick={() => router.push(`/admin/location/create`)}>
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Button onClick={() => router.push("/admin/location/bulk")}>
        Bulk Upload
      </Button>
      <Separator />
      <DataTable
        columns={locationColumns}
        data={data}
        searchKey="city"
        serverSide
        fetchData={fetchLocations}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for locations" />
      <ApiList entityName="locations" entityIdName="locationId" />
    </>
  );
};