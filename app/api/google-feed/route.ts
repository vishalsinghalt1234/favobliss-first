import { db } from "@/lib/db";

export const runtime = "nodejs";
export const revalidate = 43200; // refresh feed every 12 hours (good for Merchant Center)

// Small helpers
const xmlEscape = (value: any) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const getBaseUrl = () => {
  // Prefer explicit site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  
  // Local fallback
  return "http://localhost:3000";
};

const pickPrice = (variant: any) => {
  const defaultLgId = process.env.GOOGLE_FEED_DEFAULT_LOCATION_GROUP_ID;

  // 1) Prefer default location group price (if set)
  if (defaultLgId && Array.isArray(variant?.variantPrices)) {
    const vp = variant.variantPrices.find((x: any) => x.locationGroupId === defaultLgId && x.price > 0);
    if (vp?.price) return { price: vp.price, mrp: vp.mrp || vp.price };
  }

  // 2) Otherwise pick the lowest valid price across all location groups
  const all = (variant?.variantPrices || []).filter((x: any) => x?.price > 0);
  if (all.length) {
    const lowest = all.reduce((min: any, cur: any) => (cur.price < min.price ? cur : min), all[0]);
    return { price: lowest.price, mrp: lowest.mrp || lowest.price };
  }

  // 3) Fallback
  return { price: 0, mrp: 0 };
};

const pickImage = (variant: any) => {
  const images = Array.isArray(variant?.images) ? variant.images : [];
  if (!images.length) return "/placeholder-image.jpg";

  // Don’t mutate original; pick earliest createdAt (your UI logic)
  const sorted = [...images].sort((a: any, b: any) => {
    const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (ta !== tb) return ta - tb;
    return (a?.id || "").localeCompare(b?.id || "");
  });

  return sorted?.[0]?.url || "/placeholder-image.jpg";
};

export async function GET() {
  const baseUrl = getBaseUrl();

  // Pull products from DB automatically
  // We output one <item> per VARIANT (because your storefront routes are variant slugs: /{variant.slug})
  const products = await db.product.findMany({
    where: {
      isArchieved: false,
    },
    include: {
      brand: true,
      category: true,
      subCategory: true,
      variants: {
        include: {
          images: true,
          variantPrices: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 5000, // safe cap, change if you need more
  });

  const items: string[] = [];

  for (const p of products) {
    for (const v of p.variants || []) {
      // Skip invalid variant slugs (must exist)
      if (!v?.slug) continue;

      const { price } = pickPrice(v);

      // Merchant Center hates 0 price — skip items without price
      if (!price || price <= 0) continue;

      const imageUrlRaw = pickImage(v);
      const imageUrl = imageUrlRaw.startsWith("http") ? imageUrlRaw : `${baseUrl}${imageUrlRaw.startsWith("/") ? "" : "/"}${imageUrlRaw}`;

      const productUrl = `${baseUrl}/${v.slug}`;

      const availability = v.stock > 0 ? "in stock" : "out of stock";

      // Optional Google fields
      const gtin = v.gtin ? String(v.gtin).trim() : "";
      const mpn = v.sku ? String(v.sku).trim() : "";
      const brandName = p?.brand?.name || "Generic";

      const title = v.metaTitle || v.name || "Product";
      const desc = v.metaDescription || v.description || v.about || "";

      items.push(`
<item>
  <g:id>${xmlEscape(v.id)}</g:id>
  <g:item_group_id>${xmlEscape(p.id)}</g:item_group_id>
  <g:title>${xmlEscape(title)}</g:title>
  <g:description>${xmlEscape(desc)}</g:description>
  <g:link>${xmlEscape(productUrl)}</g:link>
  <g:image_link>${xmlEscape(imageUrl)}</g:image_link>
  <g:availability>${availability}</g:availability>
  <g:condition>new</g:condition>
  <g:price>${price} INR</g:price>
  <g:brand>${xmlEscape(brandName)}</g:brand>
  ${gtin ? `<g:gtin>${xmlEscape(gtin)}</g:gtin>` : ""}
  ${!gtin && mpn ? `<g:mpn>${xmlEscape(mpn)}</g:mpn>` : ""}
  ${p?.category?.name ? `<g:product_type>${xmlEscape(p.category.name)}</g:product_type>` : ""}
</item>`.trim());
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>${xmlEscape("Favobliss")}</title>
  <link>${xmlEscape(baseUrl)}</link>
  <description>${xmlEscape("Google Merchant Center product feed")}</description>
  ${items.join("\n")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // helps CDN + Google fetches
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
