'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { shippingSchema, type ShippingData } from '@/lib/validators';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const SHIPPING_COST = 1490;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<ShippingData>({
    email: '',
    phone: '',
    shippingName: '',
    shippingZip: '',
    shippingCity: '',
    shippingAddress: '',
    shippingNote: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/kosar');
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  const subtotal = total();
  const grandTotal = subtotal + SHIPPING_COST;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = shippingSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping: result.data }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ _form: data.error || 'Hiba történt a rendelés során.' });
        setLoading(false);
        return;
      }

      clearCart();
      window.location.href = data.url;
    } catch {
      setErrors({ _form: 'Hiba történt. Kérjük, próbáld újra.' });
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold font-heading mb-8">PÉNZTÁR</h1>

      {errors._form && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          {errors._form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left column: Shipping form */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-heading mb-4">Szállítási adatok</h2>

          <Input
            label="E-mail cím"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            label="Telefonszám"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <Input
            label="Név"
            name="shippingName"
            value={form.shippingName}
            onChange={handleChange}
            error={errors.shippingName}
            required
          />
          <Input
            label="Irányítószám"
            name="shippingZip"
            value={form.shippingZip}
            onChange={handleChange}
            error={errors.shippingZip}
            required
          />
          <Input
            label="Város"
            name="shippingCity"
            value={form.shippingCity}
            onChange={handleChange}
            error={errors.shippingCity}
            required
          />
          <Input
            label="Cím"
            name="shippingAddress"
            value={form.shippingAddress}
            onChange={handleChange}
            error={errors.shippingAddress}
            required
          />
          <Input
            label="Megjegyzés (opcionális)"
            name="shippingNote"
            value={form.shippingNote}
            onChange={handleChange}
            error={errors.shippingNote}
          />
        </div>

        {/* Right column: Order summary */}
        <div>
          <h2 className="text-xl font-bold font-heading mb-4">Rendelés összesítő</h2>

          <div className="bg-surface-container rounded-2xl p-6 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-4 border-b border-outline-variant pb-4 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-carbon truncate">{item.name}</p>
                  {item.babyName && (
                    <p className="text-sm text-carbon-light">
                      {item.babyName}
                      {item.birthDate && ` • ${item.birthDate}`}
                      {item.birthWeight && ` • ${item.birthWeight}`}
                      {item.birthHeight && ` • ${item.birthHeight}`}
                    </p>
                  )}
                  <p className="text-sm text-carbon-light">Mennyiség: {item.quantity}</p>
                </div>
                <p className="font-bold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}

            <div className="border-t border-outline-variant pt-4 space-y-2">
              <div className="flex justify-between text-carbon-light">
                <span>Részösszeg</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-carbon-light">
                <span>Szállítás</span>
                <span>{formatPrice(SHIPPING_COST)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-outline-variant">
                <span>Összesen</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Feldolgozás...' : 'Fizetés'}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
