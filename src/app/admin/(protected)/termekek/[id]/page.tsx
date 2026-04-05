import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductForm from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/termekek"
          className="text-sm text-on-surface/60 hover:text-on-surface"
        >
          ← Termékek
        </Link>
        <h1 className="text-2xl font-headline font-bold text-on-surface mt-2">
          {product.name}
        </h1>
      </div>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          category: product.category,
          series: product.series,
          variant: product.variant,
          imageUrl: product.imageUrl,
          images: product.images ?? [],
          badge: product.badge ?? '',
          active: product.active,
          onSale: product.onSale,
          salePrice: product.salePrice ?? '',
        }}
      />
    </div>
  );
}
