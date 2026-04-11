import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    badge?: string | null;
    category?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const showFromPrice = product.category === 'giftcard' || product.category === 'poster';
  return (
    <Link href={`/termekek/${product.slug}`} className="group cursor-pointer card-hover block">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container-low mb-6 ghost-border max-w-[85%] mx-auto">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 85vw, (max-width: 1024px) 42vw, 28vw"
        />
        {product.badge && (
          <div className="absolute top-4 right-4">
            <span className="badge-shimmer px-3 py-1 rounded-lg glass-nav text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
              {product.badge}
            </span>
          </div>
        )}
      </div>
      <div className="text-center">
        <h4 className="text-base uppercase tracking-[0.08em] text-carbon font-normal">{product.name}</h4>
        <p className="text-sm uppercase tracking-[0.05em] text-carbon-light mt-1 font-normal">
          {showFromPrice
            ? `${formatPrice(product.price)}-tól`
            : formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
