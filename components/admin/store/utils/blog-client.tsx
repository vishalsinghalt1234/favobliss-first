"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/admin/store/utils/header";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BlogColumn, blogColumns } from "./columns";
import { DataTable } from "@/components/admin/store/utils/data-table";

interface BlogClientProps {
  data: BlogColumn[]; 
  initialRowCount: number; 
}

export const BlogClient = ({ data, initialRowCount }: BlogClientProps) => {
  const router = useRouter();

  const createNew = () => {
    console.log("clicked");
    router.push(`/admin/blog/create`);
  };

  const fetchBlogs = async (options: {
    pageIndex: number;
    pageSize: number;
    filters: { id: string; value: unknown }[];
  }) => {
    const searchFilter = options.filters.find((f) => f.id === "title")?.value as string | undefined;
    const res = await fetch(
      `/api/admin/${process.env.NEXT_PUBLIC_STORE_ID}/blogs?page=${options.pageIndex + 1}&pageSize=${options.pageSize}${searchFilter ? `&search=${encodeURIComponent(searchFilter)}` : ""}`
    );
    if (!res.ok) throw new Error("Failed to fetch blogs");
    return res.json(); 
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Header title="Blog Posts" badge={initialRowCount.toString()} description="Manage your blog posts" />
        <Button onClick={createNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={blogColumns}
        data={data}
        searchKey="title"
        serverSide
        fetchData={fetchBlogs}
        initialRowCount={initialRowCount}
      />
    </>
  );
};