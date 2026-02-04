import { getProductBySlug } from "@/actions/get-product";
import { getProducts } from "@/actions/get-products";
import { getLocationGroups } from "@/actions/get-location-group";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { ProductPageContent } from "@/components/store/ProductPageClient";

interface ProductPageProps {
  params: { slug: string };
}

export const revalidate = 86400;

// Validate slug early (prevents bot/file-like paths, image filenames, etc.)
function isValidSlug(slug: string): any {
  if (!slug || typeof slug !== "string") return false;

  // prevent extremely long/short bot slugs
  if (slug.length < 2 || slug.length > 120) return false;

  // block any file-like or path-like slugs
  if (
    slug.includes(".") ||
    slug.includes("/") ||
    slug.includes("\\") ||
    slug.toLowerCase().includes("%2f")
  )
    return false;

  // allow only typical slug chars: a-z, 0-9, hyphen
  // If your real slugs include underscores, change to: /^[a-z0-9-_]+$/i
  const ok = /^[a-z0-9-]+$/i.test(slug);
  if (!ok) return false;

  return true;
}

export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;

  // Early validation
  if (!isValidSlug(slug)) {
    console.warn(`[generateMetadata] Invalid slug: ${slug}`);
    return {
      title: "Product Not Found",
      description: "The requested product is not available.",
    };
  }

  try {
    const productData = await getProductBySlug(slug, false, undefined);


    if (!productData || !productData.variant) {
      return {
        title: "Product Not Found",
        description: "The requested product is not available.",
      };
    }

    const { variant } = productData;
    const previousImages = (await parent).openGraph?.images || [];

    const title = variant.metaTitle || `Buy ${variant.name}`;
    const description = variant.metaDescription || variant.description;
    const keywords = variant.metaKeywords?.length ? variant.metaKeywords : [];
    const ogImage =
      variant.openGraphImage ||
      variant.images?.[0]?.url ||
      "/placeholder-image.jpg";

    return {
      title,
      description,
      keywords,
      openGraph: {
        images: [
          {
            url: ogImage,
            height: 1200,
            width: 900,
          },
          ...previousImages,
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [
          {
            url: ogImage,
            height: 1200,
            width: 900,
          },
        ],
      },
      category: "ecommerce",
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: "Product Not Found",
      description: "The requested product is not available.",
    };
  }
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = params;

  // Early validation
  if (!isValidSlug(slug)) {
    console.warn(`[ProductPage] Invalid slug: ${slug}`);
    notFound();
  }

  try {
    // ✅ Gate all extra work behind "product exists"
    // This prevents bots hitting random slugs from triggering multiple backend calls.
    const productData = await getProductBySlug(slug, false, undefined);


    if (!productData || !productData.variant || !productData.allVariants?.length) {
      notFound();
    }

    const [locationGroups, productsDataWithCategory] = await Promise.all([
      getLocationGroups().catch(() => []),
      productData.product?.categoryId
        ? getProducts({
            categoryId: productData.product.categoryId,
            limit: 10,
          }).catch(() => ({ products: [], totalCount: 0 }))
        : Promise.resolve({ products: [], totalCount: 0 }),
    ]);

    const suggestProducts = productsDataWithCategory.products.filter(
      (item) => item.id !== productData.product.id
    );

    return (
      <ProductPageContent
        productData={productData}
        suggestProducts={suggestProducts}
        locationGroups={locationGroups}
      />
    );
  } catch (error) {
    console.error("Error in ProductPage:", error);
    notFound();
  }
};

export default ProductPage;
