import { getColors } from "@/actions/get-colors";
import { getSizes } from "@/actions/get-sizes";
import { getBrands } from "@/actions/get-brands";
import { getLocationGroups } from "@/actions/get-location-group";
import { Container } from "@/components/ui/container";
import { Metadata, ResolvingMetadata } from "next";
import { PriceRange } from "@/types";
import Breadcrumb from "@/components/store/Breadcrumbs";
import SearchProductListClient from "@/components/store/SearchProductListCIient";
import { getSearchItem } from "@/actions/get-search-item";
import { NoResults } from "@/components/store/no-results";

import { Filter } from "./_components/filter";
import { MobileFilters } from "./_components/mobile-filters";

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 100,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

interface SearchPageProps {
  searchParams: {
    query?: string;
    colorId?: string;
    sizeId?: string;
    page?: string;
    price?: string;
    brandId?: string;
    rating?: string;
    discount?: string;
  };
}

export async function generateMetadata(
  { searchParams }: SearchPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "Search Result | Get Deals, Shop Now!",
    description:
      "Discover the newest styles & trends for every occasion. Shop Latest Launches products.",
    openGraph: {
      type: "website",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Latest Launches | Get Deals, Shop Now!",
      description:
        "Discover the newest styles & trends for every occasion. Shop Latest Launches products.",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
      ],
    },
    category: "ecommerce",
  };
}

const Search = async ({ searchParams }: SearchPageProps) => {
  const query = searchParams.query || "";

  if (!query) {
    return (
      <div className="bg-white">
        <Container>
          <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-24">
            <NoResults />
          </div>
        </Container>
      </div>
    );
  }

  const [sizes, colors, brands, locationGroups] = await Promise.all([
    withRetry(() => getSizes()),
    withRetry(() => getColors()),
    withRetry(() => getBrands()),
    withRetry(() => getLocationGroups()),
  ]);

  const searchResults = await withRetry(() =>
    getSearchItem({ query, limit: "1000", page: 1 } as any),
  );
  const allProducts = searchResults.products || [];

  let classification = "TOPWEAR";
  if (allProducts.length > 0) {
    classification = allProducts[0]?.category?.classification || "TOPWEAR";
  }

  const sizeMap: { [key: string]: string[] } = {
    TOPWEAR: ["S", "M", "L", "XL", "XXL"],
    BOTTOMWEAR: ["S", "M", "L", "XL", "XXL"],
    FOOTWEAR: ["6", "7", "8", "9", "10", "11"],
    INNERWEARANDSLEEPWEAR: ["S", "M", "L", "XL"],
    MAKEUP: [],
    SKINCARE: [],
    HAIRCARE: [],
    FRAGRANCES: [],
    TELEVISION: [],
  };
  const validSizes = sizeMap[classification] || [];
  const filteredSizes = sizes.filter((size) => validSizes.includes(size.name));

  const priceRange: PriceRange[] = [
    { id: "0-5000", name: "Rs. 0 to Rs. 5000", value: "0-5000" },
    { id: "5000-10000", name: "Rs. 5000 to Rs. 10000", value: "5000-10000" },
    { id: "10000-30000", name: "Rs. 10000 to Rs. 30000", value: "10000-30000" },
    { id: "30000-80000", name: "Rs. 30000 to Rs. 80000", value: "30000-80000" },
    { id: "80000", name: "Above Rs. 80000", value: "80000" },
  ];
  const ratingRanges = [
    { id: "4", name: "4★ & above", value: "4" },
    { id: "3", name: "3★ & above", value: "3" },
    { id: "2", name: "2★ & above", value: "2" },
    { id: "1", name: "1★ & above", value: "1" },
  ];

  const discountRanges = [
    { id: "70", name: "70% and above", value: "70" },
    { id: "60", name: "60% and above", value: "60" },
    { id: "50", name: "50% and above", value: "50" },
    { id: "40", name: "40% and above", value: "40" },
    { id: "30", name: "30% and above", value: "30" },
    { id: "20", name: "20% and above", value: "20" },
    { id: "10", name: "10% and above", value: "10" },
  ];

  const breadcrumbItems = [
    { label: query.toUpperCase(), href: `/search?query=${query}&page=1` },
  ];

  return (
    <div className="bg-white">
      <Breadcrumb items={breadcrumbItems} />

      {/* Optional: Simple search header (no banner like category) */}
      <div className="bg-gray-50 py-6">
        <Container>
          <h1 className="text-2xl md:text-3xl font-bold px-4">
            Search results for &quot;
            <span className="text-blue-600">{query}</span>&quot;
          </h1>
        </Container>
      </div>

      <Container>
        <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-24">
          <div className="lg:grid lg:grid-cols-5 lg:gap-x-8 mt-6">
            {/* Mobile Filters */}
            <MobileFilters
              sizes={filteredSizes}
              colors={colors}
              brands={brands}
              priceRanges={priceRange}
              ratingRanges={ratingRanges}
              discountRanges={discountRanges}
            />

            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:border-r lg:col-span-1">
              <h3 className="mb-5 text-lg font-bold">Filters</h3>
              {/* <Filter valueKey="sizeId" name="Sizes" data={filteredSizes} /> */}
              <Filter valueKey="colorId" name="Colors" data={colors} />
              <Filter valueKey="price" name="Price" data={priceRange} />
              <Filter valueKey="brandId" name="Brands" data={brands} />
              <Filter valueKey="rating" name="Ratings" data={ratingRanges} />
              <Filter
                valueKey="discount"
                name="Discount"
                data={discountRanges}
              />
            </div>

            {/* Product Content Area */}
            <div className="mt-6 lg:col-span-4 lg:mt-4">
              <SearchProductListClient
                searchQuery={query}
                locationGroups={locationGroups}
                filteredSizes={filteredSizes}
                colors={colors}
                brands={brands}
                priceRanges={priceRange}
                ratingRanges={ratingRanges}
                discountRanges={discountRanges}
                allProducts={allProducts}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Search;