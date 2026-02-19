import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ProductSchema } from "@/schemas/admin/product-form-schema";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";

const allowedOrigins = [
  process.env.NEXT_PUBLIC_FRONTEND_URL,
  "http://localhost:3000",
  "https://favobliss.vercel.app",
].filter(Boolean);
const PRODUCT_TAG = "products";
const CATEGORY_TAG = "categories";

export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await auth();
    const body = await request.json();
    const validatedData = ProductSchema.safeParse(body);

    if (!validatedData.success) {
      return new NextResponse(
        JSON.stringify({ errors: validatedData.error.format() }),
        { status: 400 }
      );
    }

    const {
      brandId,
      sizeAndFit,
      materialAndCare,
      enabledFeatures,
      expressDelivery,
      warranty,
      isFeatured,
      isNewArrival,
      isArchieved,
      categoryId,
      subCategoryId,
      variants,
    } = validatedData.data;

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized Access", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const storeById = await db.store.findUnique({
      where: { id: params.storeId },
    });

    if (!storeById) {
      return new NextResponse("Store does not exist", { status: 404 });
    }

    const category = await db.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return new NextResponse("Invalid category", { status: 400 });
    }

    if (subCategoryId) {
      const subCategory = await db.subCategory.findUnique({
        where: { id: subCategoryId },
      });
      if (!subCategory) {
        return new NextResponse("Invalid subcategory", { status: 400 });
      }
      if (subCategory.categoryId !== categoryId) {
        return new NextResponse(
          "Subcategory must belong to the selected category",
          { status: 400 }
        );
      }
    }

    if (brandId) {
      const brand = await db.brand.findUnique({
        where: { id: brandId, storeId: params.storeId },
      });
      if (!brand) {
        return new NextResponse("Invalid brand", { status: 400 });
      }
    }

    for (const variant of variants) {
      if (variant.specifications && variant.specifications.length > 0) {
        const specificationFieldIds = variant.specifications.map(
          (spec) => spec.specificationFieldId
        );
        const specificationFields = await db.specificationField.findMany({
          where: {
            id: { in: specificationFieldIds },
            storeId: params.storeId,
          },
        });

        if (specificationFields.length !== specificationFieldIds.length) {
          return new NextResponse(
            "One or more specification fields are invalid",
            { status: 400 }
          );
        }
      }

      if (variant.sizeId !== null && variant.sizeId) {
        const size = await db.size.findUnique({
          where: { id: variant.sizeId },
        });
        if (!size) {
          return new NextResponse("Invalid size in variant", { status: 400 });
        }
      }
      if (variant.colorId !== null && variant.colorId) {
        const color = await db.color.findUnique({
          where: { id: variant.colorId },
        });
        if (!color) {
          return new NextResponse("Invalid color in variant", { status: 400 });
        }
      }
      if (variant.slug) {
        const existingVariant = await db.variant.findUnique({
          where: { slug: variant.slug },
        });
        if (existingVariant) {
          return new NextResponse(`Slug ${variant.slug} already exists`, {
            status: 400,
          });
        }
      }
      if (variant.sku) {
        const existingVariant = await db.variant.findUnique({
          where: { sku: variant.sku },
        });
        if (existingVariant) {
          return new NextResponse(`SKU ${variant.sku} already exists`, {
            status: 400,
          });
        }
      }

      if (!variant.variantPrices || variant.variantPrices.length === 0) {
        return new NextResponse(
          "Each variant must have at least one price for a location group",
          { status: 400 }
        );
      }

      if (variant.variantPrices.length > 0) {
        const locationGroupIds = variant.variantPrices.map(
          (vp) => vp.locationGroupId
        );
        const locationGroups = await db.locationGroup.findMany({
          where: {
            id: { in: locationGroupIds },
            storeId: params.storeId,
          },
        });
        if (locationGroups.length !== locationGroupIds.length) {
          return new NextResponse(
            "One or more location group IDs in variant prices are invalid",
            { status: 400 }
          );
        }
      }
    }

    const product = await db.product.create({
      data: {
        brandId,
        sizeAndFit,
        materialAndCare,
        enabledFeatures,
        expressDelivery,
        warranty,
        isFeatured,
        isNewArrival,
        isArchieved,
        categoryId,
        subCategoryId,
        storeId: params.storeId,
        variants: {
          create: variants.map((variant) => ({
            name: variant.name,
            slug: variant.slug,
            about: variant.about,
            description: variant.description,
            metaTitle: variant.metaTitle,
            metaDescription: variant.metaDescription,
            metaKeywords: variant.metaKeywords,
            openGraphImage: variant.openGraphImage,
            stock: variant.stock,
            sku: variant.sku || undefined,
            hsn: variant.hsn || undefined,
            tax: variant.tax || undefined,
            gtin: variant.gtin || undefined,
            sizeId: variant.sizeId === null ? null : variant.sizeId,
            colorId: variant.colorId === null ? null : variant.colorId,
            images: {
              create: variant.media.map((media) => ({
                url: media.url,
                mediaType: media.mediaType || "IMAGE",
              })),
            },
            variantPrices: {
              create: variant.variantPrices?.map((vp) => ({
                locationGroupId: vp.locationGroupId,
                price: vp.price,
                mrp: vp.mrp,
              })),
            },
            variantSpecifications: {
              create: variant.specifications?.map((spec) => ({
                specificationFieldId: spec.specificationFieldId,
                value: spec.value,
              })),
            },
          })),
        },
      },
      include: {
        brand: true,
        variants: {
          include: {
            images: true,
            variantPrices: {
              include: {
                locationGroup: true,
              },
            },
            variantSpecifications: true,
          },
        },
      },
    });
    // ✅ Purge cached product & listing data instantly (new products appear without rebuild)
    revalidateTag(PRODUCT_TAG);
    revalidateTag(CATEGORY_TAG);

    // ✅ Revalidate product detail pages (slug route is /[slug])
    if (product?.variants?.length) {
      for (const v of product.variants) {
        if (v?.slug) revalidatePath(`/${v.slug}`);
      }
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.log("[PRODUCTS_POST]", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Slug or SKU already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Unexpected error occurred" },
      { status: 500 }
    );
  }
}

const getSubCategoryName = (subCategory: any, subCategories: any[]): string => {
  if (!subCategory?.parentId) return subCategory?.name || "None";
  const parent = subCategories.find((sub) => sub.id === subCategory.parentId);
  return parent
    ? `${getSubCategoryName(parent, subCategories)} > ${subCategory.name}`
    : subCategory?.name || "None";
};

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

    const where: Prisma.ProductWhereInput = {
      storeId: params.storeId,
      ...(search
        ? {
            OR: [
              { variants: { some: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
              { variants: { some: { slug: { contains: search } } } },
            ],
          }
        : {}),
    };

    const [products, subCategories, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          subCategory: {
            include: { parent: true },
          },
          variants: {
            orderBy: { createdAt: "asc" },
            take: 1,
            include: {
              size: true,
              color: true,
              variantPrices: { take: 1 },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.subCategory.findMany({
        where: { storeId: params.storeId },
        include: { parent: true },
      }),
      db.product.count({ where }),
    ]);

    const formattedProducts = products.map((product) => {
      const firstVariant = product.variants[0];
      const price = firstVariant?.variantPrices[0]?.price.toString() || "N/A";
      const stock = firstVariant?.stock || 0;
      const size = firstVariant?.size?.value || "None";
      const color = firstVariant?.color?.name || "None";

      return {
        id: product.id,
        name: firstVariant?.name || "Unnamed Variant",
        slug: firstVariant?.slug || "",
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        isArchieved: product.isArchieved,
        price,
        stock,
        size,
        color,
        category: product.category?.name || "None",
        subCategory: getSubCategoryName(product.subCategory, subCategories),
        createdAt: format(product.createdAt, "MMMM do, yyyy"),
      };
    });

    return NextResponse.json({
      rows: formattedProducts,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}