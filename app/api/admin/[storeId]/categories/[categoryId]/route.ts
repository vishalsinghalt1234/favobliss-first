import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { CategoryFormSchema } from "@/schemas/admin/category-form-schema";
import { revalidatePath, revalidateTag } from "next/cache";

const PRODUCT_TAG = "products";
const CATEGORY_TAG = "categories";

export async function PATCH(
  request: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const session = await auth();
    const body = await request.json();
    const validatedData = CategoryFormSchema.safeParse(body);

    if (!validatedData.success) {
      return new NextResponse("Invalid data provided", { status: 400 });
    }

    const { name, slug, bannerImage, landingPageBanner, description, metaTitle } = validatedData.data;

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized Access", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!params.categoryId) {
      return new NextResponse("Category Id is required", { status: 400 });
    }

    const storeById = await db.store.findUnique({
      where: {
        id: params.storeId,
      },
    });

    if (!storeById) {
      return new NextResponse("Store does not exist", { status: 404 });
    }
    const categoryBeforeUpdate = await db.category.findUnique({
      where: { id: params.categoryId },
      select: { slug: true },
    });

    const category = await db.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        slug,
        landingPageBanner,
        bannerImage,
        description,
        metaTitle
      },
    });
    // ✅ Purge cached category + product listing data
    revalidateTag(CATEGORY_TAG);
    revalidateTag(PRODUCT_TAG);

    // ✅ Revalidate old + new category pages (slug may have changed)
    if (categoryBeforeUpdate?.slug) {
      revalidatePath(`/category/${categoryBeforeUpdate.slug}`);
    }
    if (category?.slug) {
      revalidatePath(`/category/${category.slug}`);
    }

    // Optional: refresh global pages that show categories
    revalidatePath(`/category`);
    revalidatePath(`/`);

    return NextResponse.json(category);
  } catch (error: any) {
    console.log("[CATEGORIES_PATCH]", error);
    if (error.code === "P2002") {
      return new NextResponse("Slug already exists", { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized Access", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    if (!params.categoryId) {
      return new NextResponse("Category Id is required", { status: 400 });
    }

    const storeById = await db.store.findUnique({
      where: {
        id: params.storeId,
      },
    });

    if (!storeById) {
      return new NextResponse("Store does not exist", { status: 404 });
    }

    const products = await db.product.findFirst({
      where: { categoryId: params.categoryId },
    });
    const subCategories = await db.subCategory.findFirst({
      where: { categoryId: params.categoryId },
    });

    if (products || subCategories) {
      return new NextResponse(
        "Cannot delete category with associated products or subcategories",
        { status: 400 }
      );
    }
    const categoryBeforeDelete = await db.category.findUnique({
      where: { id: params.categoryId },
      select: { slug: true },
    });

    const category = await db.category.delete({
      where: {
        id: params.categoryId,
      },
    });
    // ✅ Purge cached category + product listing data
    revalidateTag(CATEGORY_TAG);
    revalidateTag(PRODUCT_TAG);

    // ✅ Revalidate deleted category page so it stops being served
    if (categoryBeforeDelete?.slug) {
      revalidatePath(`/category/${categoryBeforeDelete.slug}`);
    }

    // Optional: refresh global pages that show categories
    revalidatePath(`/category`);
    revalidatePath(`/`);

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORIES_DELETE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("Category Id is required", { status: 400 });
    }

    const category = await db.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
