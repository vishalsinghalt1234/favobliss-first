import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { HomepageCategoryColumn } from "@/components/admin/store/utils/columns";
import { HomepageCategoryClient } from "@/components/admin/store/utils/homepage-category-client";

export const metadata: Metadata = {
  title: "Store | Homepage Categories",
};

const HomepageCategoriesPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const pageSize = 10;

  const homepageCategories = await db.homepageCategory.findMany({
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

  const total = await db.homepageCategory.count({
    where: {
      storeId: params.storeId,
    },
  });

  const formattedHomepageCategories: HomepageCategoryColumn[] =
    homepageCategories.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || "No description",
      link: item?.link || "/",
      productCount: item.products.length,
      productNames: item.products.map(
        (cp) => cp.product.variants[0]?.name || "Unnamed Product"
      ),
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <HomepageCategoryClient
          data={formattedHomepageCategories}
          initialRowCount={total}
        />
      </div>
    </div>
  );
};

export default HomepageCategoriesPage;