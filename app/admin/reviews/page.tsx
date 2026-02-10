import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { ReviewColumn } from "@/components/admin/store/utils/columns";
import { ReviewClient } from "@/components/admin/store/utils/review-client";

export const metadata: Metadata = {
  title: "Store | Reviews",
};

const ReviewsPage = async ({ params }: { params: { storeId: string } }) => {
  const pageSize = 10;

  const reviews = await db.review.findMany({
    where: {
      product: {
        storeId: params.storeId,
      },
    },
    include: {
      product: {
        include: {
          variants: {
            take: 1,
            select: {
              name: true,
            },
          },
        },
      },
      images: true,
    },
    take: pageSize,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await db.review.count({
    where: {
      product: {
        storeId: params.storeId,
      },
    },
  });

  const formattedReviews: ReviewColumn[] = reviews.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.variants[0]?.name || "Unnamed Product",
    userName: item.userName,
    rating: item.rating,
    text: item.text,
    imageCount: item.images.length,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ReviewClient data={formattedReviews} initialRowCount={total} />
      </div>
    </div>
  );
};

export default ReviewsPage;