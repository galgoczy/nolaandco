export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import ProductRowActions from './ProductRowActions';
import ProductSortButtons from './ProductSortButtons';

export default async function AdminProductsPage() {
  const [products, dbCats] = await Promise.all([
    prisma.product.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
    prisma.category.findMany(),
  ]);
  const categoryLabels: Record<string, string> = {};
  dbCats.forEach((c) => { categoryLabels[c.slug] = c.name; });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface">Termékek</h1>
        <Link
          href="/admin/termekek/uj"
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Új termék
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-outline-variant text-left bg-surface-container-low">
                <th className="p-4 text-on-surface/60 font-medium w-10">Sorrend</th>
                <th className="p-4 text-on-surface/60 font-medium">Kép</th>
                <th className="p-4 text-on-surface/60 font-medium">Név</th>
                <th className="p-4 text-on-surface/60 font-medium">Kategória</th>
                <th className="p-4 text-on-surface/60 font-medium text-right">Ár</th>
                <th className="p-4 text-on-surface/60 font-medium text-center">Státusz</th>
                <th className="p-4 text-on-surface/60 font-medium text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr
                  key={product.id}
                  className="border-b border-outline-variant/40 last:border-none"
                >
                  <td className="p-4">
                    <ProductSortButtons
                      productId={product.id}
                      isFirst={idx === 0}
                      isLast={idx === products.length - 1}
                      allIds={products.map((p) => p.id)}
                      currentIdx={idx}
                    />
                  </td>
                  <td className="p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                    />
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/termekek/${product.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="p-4 text-on-surface/70">
                    {categoryLabels[product.category] ?? product.category}
                  </td>
                  <td className="p-4 text-right">
                    {product.onSale && product.salePrice ? (
                      <div>
                        <div className="font-semibold text-red-600">
                          {formatPrice(product.salePrice)}
                        </div>
                        <div className="text-xs text-on-surface/50 line-through">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium">{formatPrice(product.price)}</div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {product.active ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktív
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Inaktív
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <ProductRowActions id={product.id} name={product.name} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface/60">
                    Még nincs termék. Kattints az &ldquo;Új termék&rdquo; gombra.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
