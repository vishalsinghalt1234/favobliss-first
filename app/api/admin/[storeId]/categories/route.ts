import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { CategoryFormSchema } from "@/schemas/admin/category-form-schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";

const PRODUCT_TAG = "products";
const CATEGORY_TAG = "categories";

export async function POST(
  request: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const session = await auth();
    const body = await request.json();
    const validatedData = CategoryFormSchema.safeParse(body);

    if (!validatedData.success) {
      return new NextResponse("Invalid data provided", { status: 400 });
    }

    const { name, slug, bannerImage, landingPageBanner, description, metaTitle } =
      validatedData.data;

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized Access", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    const storeById = await db.store.findUnique({
      where: {
        id: params.storeId,
      },
    });

    if (!storeById) {
      return new NextResponse("Store does not exist", { status: 404 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        bannerImage,
        description,
        landingPageBanner,
        metaTitle,
        storeId: params.storeId,
      },
    });
    // ✅ Category changes affect navigation + category pages
    revalidateTag(CATEGORY_TAG);
    revalidateTag(PRODUCT_TAG);

    // ✅ Revalidate category page path if your storefront uses /category/[slug]
    if (category?.slug) {
      revalidatePath(`/category/${category.slug}`);
    }

    // Optional: also revalidate homepage/category listing pages if they exist
    revalidatePath(`/category`);
    revalidatePath(`/`);

    return NextResponse.json(category);
  } catch (error: any) {
    console.log("[CATEGORIES_POST]", error);
    if (error.code === "P2002") {
      return new NextResponse("Slug already exists", { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      // Keep your existing slug logic (with nested includes if needed)
      const category = await db.category.findUnique({
        where: { slug },
        include: {
          subCategories: {
            include: {
              childSubCategories: {
                include: {
                  childSubCategories: {
                    include: {
                      childSubCategories: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!category) {
        return new NextResponse("Category not found", { status: 404 });
      }

      return NextResponse.json(category);
    }

    // ── Pagination + Search support ─────────────────────────────────
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
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

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.category.count({ where }),
    ]);

    // If you still need the nested subCategories structure in paginated list,
    // add include here (but beware of performance with deep nesting)
    // For admin table listing, you probably don't need deep nesting → can simplify

    return NextResponse.json({
      rows: categories,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
