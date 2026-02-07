import type React from "react";
import Link from "next/link";

interface PremiumProduct {
  id: string;
  title: string;
  image: string;
  link: string;
  badge?: string;
}

interface PremiumProductsSectionProps {
  products: PremiumProduct[];
  backgroundColor?: string;
  className?: string;
}

const PremiumProductsSection: React.FC<PremiumProductsSectionProps> = ({
  products,
  backgroundColor = "#9fd6ff",
  className = "",
}) => {
  return (
    <div
      className={`rounded-3xl w-full max-w-full px-4 py-8 md:p-8 md:pt-[48px] pt-[40px] ${className}`}
      style={{ backgroundColor }}
    >
            {/* Top Banner */}
      <div className="w-full mb-6">
        <img
          src="/assets/home-banner/home-banner-2.jpeg"
          alt="Home Banner"
          className="w-full h-[140px] sm:h-[170px] md:h-[220px] object-cover rounded-2xl"
          loading="lazy"
        />
      </div>

      <div className="flex overflow-x-auto space-x-6 pb-1 md:pb-4 scrollbar-hide snap-x snap-mandatory justify-between">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-[30vw] sm:w-[30vw] lg:w-[23%] snap-start"
          >
            <PremiumProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

interface PremiumProductCardProps {
  product: PremiumProduct;
}

const PremiumProductCard: React.FC<PremiumProductCardProps> = ({ product }) => {
  return (
    <Link href={product.link}>
      <div className="group cursor-pointer">
        <div className="">
          <div>
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              className="object-cover max-w-full max-h-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PremiumProductsSection;
