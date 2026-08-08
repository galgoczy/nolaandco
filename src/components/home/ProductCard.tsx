import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    /** Original (compare-at) price when the product is on sale. */
    originalPrice?: number | null;
    imageUrl: string;
    badge?: string | null;
    category?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const showFromPrice = product.category === 'giftcard' || product.category === 'poster';
  return (
    <Link href={`/termekek/${product.slug}`} className="group cursor-pointer card-hover block">
      <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-surface-container-low mb-3 ghost-border">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 767px) 50vw, (max-width: 1280px) 33vw, 400px"
          />
        ) : (
          // Fotó nélküli (még feltöltés alatt lévő) termék — semleges felület.
          <div className="absolute inset-0 flex items-center justify-center bg-[#EFEAE2] text-carbon-light/50 text-[10px] tracking-[0.2em] uppercase text-center px-4">
            Fotó hamarosan
          </div>
        )}
        {product.badge && (
          <div className="absolute top-4 right-4">
            <span
              className="badge-shimmer px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
              style={{ backgroundColor: '#D55850' }}
            >
              {product.badge}
            </span>
          </div>
        )}
      </div>
      <div className="text-center">
        <h4 className="text-base tracking-[0.08em] text-carbon font-normal">{product.name}</h4>
        {product.originalPrice ? (
          <p className="text-sm tracking-[0.05em] mt-1">
            <span className="text-carbon-light/70 line-through mr-2">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="font-semibold text-[#D55850]">{formatPrice(product.price)}</span>
          </p>
        ) : (
          <p className="text-sm tracking-[0.05em] text-carbon-light mt-1 font-normal">
            {showFromPrice
              ? `${formatPrice(product.price)}-tól`
              : formatPrice(product.price)}
          </p>
        )}
      </div>
    </Link>
  );
}
