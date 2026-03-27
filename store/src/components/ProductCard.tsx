import Link from "next/link";
import { ProductVariant } from "@/lib/products";

interface ProductCardProps {
  product: ProductVariant;
}

function getBadge(product: ProductVariant): {
  label: string;
  colorClass: string;
} | null {
  if (product.style === "core") {
    return { label: "Core Series", colorClass: "text-[#725948]" };
  }
  if (product.style === "atelier") {
    return { label: "Limited Edition", colorClass: "text-[#a93832]" };
  }
  return null;
}

export default function ProductCard({ product }: ProductCardProps) {
  const badge = getBadge(product);

  return (
    <Link
      href={`/termek/${product.slug}`}
      className="group block bg-[#f5f4ef] border border-[rgba(177,179,171,0.15)] rounded-3xl overflow-hidden"
    >
      {/* Image placeholder */}
      <div className="relative aspect-square bg-[#e8ddd4] flex items-center justify-center">
        <span className="font-sans text-sm text-[#725948]/60 text-center px-4">
          {product.name}
        </span>

        {badge && (
          <span
            className={`absolute top-4 right-4 backdrop-blur-[10px] bg-[rgba(253,251,247,0.95)] rounded-lg px-3 py-1 text-[10px] tracking-[1px] uppercase font-bold ${badge.colorClass}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Product name */}
      <p className="font-sans font-medium text-[18px] text-[#333] text-center mt-6 pb-6">
        {product.name}
      </p>
    </Link>
  );
}
