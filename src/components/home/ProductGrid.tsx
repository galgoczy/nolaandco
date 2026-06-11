import ProductCard from './ProductCard';
import { getListingItems } from '@/lib/productListing';

export default async function ProductGrid() {
  const items = await getListingItems();

  return (
    <section className="pt-2 pb-12 md:pt-4 md:pb-16 bg-surface" id="collection">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div id="products-start" className="scroll-mt-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
