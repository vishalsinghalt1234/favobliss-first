import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { SizeColumn } from "@/components/admin/store/utils/columns";
import { SizeClient } from "@/components/admin/store/utils/size-client";

export const metadata: Metadata = {
  title: "Store | Sizes",
};

const SizesPage = async ({ params }: { params: { storeId: string } }) => {
  const pageSize = 10;

  const sizes = await db.size.findMany({
    where: {
      storeId: params.storeId,
    },
    take: pageSize,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await db.size.count({
    where: {
      storeId: params.storeId,
    },
  });

  const formattedSizes: SizeColumn[] = sizes.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeClient data={formattedSizes} initialRowCount={total} />
      </div>
    </div>
  );
};

export default SizesPage;