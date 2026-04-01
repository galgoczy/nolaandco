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
  return (
    <Link href={`/termekek/${product.slug}`} className="group cursor-pointer card-hover block">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low mb-6 ghost-border">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <h4 className="text-lg font-medium text-carbon">{product.name}</h4>
        <p className="text-sm text-carbon-light mt-1">
          {product.category === 'giftcard'
            ? `${formatPrice(product.price)}-tól`
            : formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
