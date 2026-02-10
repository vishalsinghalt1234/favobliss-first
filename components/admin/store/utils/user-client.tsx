"use client";

import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/admin/store/utils/header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/admin/store/utils/data-table";
import { Plus } from "lucide-react";
import { Usercolumns, UserColumns } from "./columns";

interface UserClientProps {
  data: UserColumns[];
  initialRowCount: number;
}

export const UserClient = ({ data, initialRowCount }: UserClientProps) => {
  const router = useRouter();
  const params = useParams();

  const fetchUsers = async ({
    pageIndex,
    pageSize,
    filters,
  }: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchValue = filters.find((f) => f.id === "email")?.value as string | undefined;

    const url = `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/users?page=${pageIndex + 1}&limit=${pageSize}${
      searchValue ? `&search=${encodeURIComponent(searchValue)}` : ""
    }`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json(); // { rows, rowCount }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header
          title="Users"
          badge={initialRowCount.toString()}
          description="Manage all registered users"
        />
      </div>

      <Separator />
      <DataTable
        columns={Usercolumns}
        data={data}
        searchKey="email"
        serverSide
        fetchData={fetchUsers}
        initialRowCount={initialRowCount}
      />
    </>
  );
};