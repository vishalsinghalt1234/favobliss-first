import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get("page")  || "1", 10);
    const limit  = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      product: {
        storeId: params.storeId,
      },
      ...(search
        ? {
            product: {
              variants: {
                some: {
                  name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
            },
          }
        : {}),
    };

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.review.count({ where }),
    ]);

    const formattedReviews = reviews.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.variants[0]?.name || "Unnamed Product",
      userName: item.userName,
      rating: item.rating,
      text: item.text,
      imageCount: item.images.length,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return NextResponse.json({
      rows: formattedReviews,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[ADMIN_REVIEWS_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}