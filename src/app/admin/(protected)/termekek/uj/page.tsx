import Link from 'next/link';
import ProductForm, { emptyProduct } from '../ProductForm';

export default function NewProductPage() {
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
          Új termék
        </h1>
      </div>
      <ProductForm initial={emptyProduct} />
    </div>
  );
}
