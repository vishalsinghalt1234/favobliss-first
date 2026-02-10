import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { CategoryColumn } from "@/components/admin/store/utils/columns";
import { CategoryClient } from "@/components/admin/store/utils/category-client";

export const metadata: Metadata = {
  title: "Store | Categories",
};

const CategoriesPage = async ({ params }: { params: { storeId: string } }) => {
  const pageSize = 10;

  const categories = await db.category.findMany({
    where: {
      storeId: params.storeId,
    },
    take: pageSize,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await db.category.count({
    where: {
      storeId: params.storeId,
    },
  });

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryClient data={formattedCategories} initialRowCount={total} />
      </div>
    </div>
  );
};

export default CategoriesPage;