import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {format} from "date-fns";
import { revalidateTag } from "next/cache";


export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { name, description, link } = await request.json();
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized Access", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const storeById = await db.store.findUnique({
      where: {
        id: params.storeId,
      },
    });

    if (!storeById) {
      return new NextResponse("Store does not exist or unauthorized", {
        status: 404,
      });
    }

    const homepageCategory = await db.homepageCategory.create({
      data: {
        name,
        description,
        ...(link !== undefined ? { link } : {}),
        storeId: params.storeId,
      },
    });

      // Revalidate both list and specific item caches
    revalidateTag("homepage-categories");
    revalidateTag(`homepage-category-${homepageCategory.id}`);

    return NextResponse.json(homepageCategory);
  } catch (error) {
    console.log("[HOMEPAGECATEGORY_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const homepageCategoryId = searchParams.get("homepageCategoryId");

    if (homepageCategoryId) {
      // Keep detailed single-item fetch unchanged
      const homepageCategory = await db.homepageCategory.findUnique({
        where: {
          id: homepageCategoryId,
          storeId: params.storeId,
        },
        include: {
          products: {
            include: {
              product: {
                include: {
                  variants: {
                    include: {
                      images: true,
                      variantPrices: true,
                    },
                  },
                  category: true,
                  subCategory: true,
                  brand: true,
                },
              },
            },
          },
        },
      });

      if (!homepageCategory) {
        return new NextResponse("Homepage category not found", { status: 404 });
      }

      return NextResponse.json(homepageCategory);
    }

    // ── Paginated list ───────────────────────────────────────────────
    const page   = parseInt(searchParams.get("page")  || "1", 10);
    const limit  = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.HomepageCategoryWhereInput = {
      storeId: params.storeId,
      ...(search
        ? {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
    };

    const [homepageCategories, total] = await Promise.all([
      db.homepageCategory.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.homepageCategory.count({ where }),
    ]);

    // Format exactly the same way as in the server component
    const formatted = homepageCategories.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || "No description",
      link: (item as any)?.link || "/", // ✅ bypass stale prisma types

      productCount: item.products.length,
      productNames: item.products.map(
        (cp) => cp.product.variants[0]?.name || "Unnamed Product"
      ),
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return NextResponse.json({
      rows: formatted,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[HOMEPAGECATEGORY_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
