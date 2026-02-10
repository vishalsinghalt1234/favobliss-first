import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { CouponColumn } from "@/components/admin/store/utils/columns";
import { CouponClient } from "@/components/admin/store/utils/coupon-client";

export const metadata: Metadata = {
  title: "Store | Coupons",
};

const CouponsPage = async ({ params }: { params: { storeId: string } }) => {
  const pageSize = 10;

  const coupons = await db.coupon.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      products: {
        include: {
          product: {
            include: {
              variants: {
                take: 1,
              },
            },
          },
        },
      },
    },
    take: pageSize,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await db.coupon.count({
    where: {
      storeId: params.storeId,
    },
  });

  const formattedCoupons: CouponColumn[] = coupons.map((item) => ({
    id: item.id,
    code: item.code,
    isActive: item.isActive,
    value: item.value,
    startDate: format(new Date(item.startDate), "MMMM do, yyyy"),
    expiryDate: format(new Date(item.expiryDate), "MMMM do, yyyy"),
    productCount: item.products.length,
    productNames: item.products.map(
      (cp) => cp.product.variants[0]?.name || "Unnamed Product"
    ),
    usagePerUser: item.usagePerUser,
    usedCount: item.usedCount,
    description: item.description || "",
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CouponClient data={formattedCoupons} initialRowCount={total} />
      </div>
    </div>
  );
};

export default CouponsPage;