import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { BrandColumn } from "@/components/admin/store/utils/columns";
import { BrandClient } from "@/components/admin/store/utils/brand-client";

export const metadata: Metadata = {
  title: "Store | Brands",
};

const BrandsPage = async ({ params }: { params: { storeId: string } }) => {
  const pageSize = 10;

  const brands = await db.brand.findMany({
    where: {
      storeId: params.storeId,
    },
    take: pageSize,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await db.brand.count({
    where: {
      storeId: params.storeId,
    },
  });

  const formattedBrands: BrandColumn[] = brands.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BrandClient data={formattedBrands} initialRowCount={total} />
      </div>
    </div>
  );
};

export default BrandsPage;