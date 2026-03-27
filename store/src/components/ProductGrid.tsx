import ProductCard from "./ProductCard";
import { getProductsByCategory } from "@/lib/products";

export default function ProductGrid() {
  const pillows = getProductsByCategory("parna");

  return (
    <section id="parnak" className="bg-[#fbf9f5] py-24">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="text-center">
          <p className="font-display italic text-[24px] text-[#4a4a4a] leading-8">
            The Shape of Your Memories
          </p>
          <h2 className="font-heading font-light text-[60px] tracking-[6px] uppercase text-[#333] pb-4">
            EMLÉKEID FORMÁBA ÖNTVE
          </h2>
          <div className="w-12 h-[2px] bg-[#725948] mx-auto" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 mt-20">
          {pillows.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
