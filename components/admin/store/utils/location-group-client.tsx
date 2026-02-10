"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "./data-table";
import { ApiList } from "./api-list.";
import { LocationGroupColumn, locationGroupColumns } from "./columns";

interface LocationGroupClientProps {
  data: LocationGroupColumn[];
  locations: { id: string; pincode: string; city: string }[];
  initialRowCount: number;
}

export const LocationGroupClient = ({
  data,
  locations,
  initialRowCount,
}: LocationGroupClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchLocationGroups = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "name")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/location-group?page=${
      pageIndex + 1
    }&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch location groups");
    return res.json();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Location Groups"
          badge={initialRowCount.toString()}
          description="Location Groups for your store"
        />
        <Button
          onClick={() => router.push(`/admin/location-group/create`)}
        >
          <Plus className="h-4 w-4 mr-2" size="sm" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={locationGroupColumns}
        data={data}
        searchKey="name"
        serverSide
        fetchData={fetchLocationGroups}
        initialRowCount={initialRowCount}
      />
      <Header title="API" description="API calls for location groups" />
      <ApiList entityName="location-groups" entityIdName="locationGroupId" />
    </>
  );
};