'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { shippingSchema, homeDeliverySchema, type ShippingData } from '@/lib/validators';
import { formatPrice } from '@/lib/utils';
import Input from '@/components/ui/Input';
import FoxpostSelector from '@/components/checkout/FoxpostSelector';

type ShippingMethod = 'parcel' | 'home';
type CouponData = {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  description: string;
} | null;

const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  parcel: 990,
  home: 1490,
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('parcel');
  const [form, setForm] = useState<ShippingData>({
    email: '',
    phone: '',
    shippingName: '',
    shippingZip: '',
    shippingCity: '',
    shippingAddress: '',
    shippingNote: '',
  });

  // Foxpost locker selection
  const [selectedLocker, setSelectedLocker] = useState<{
    place_id: string;
    name: string;
    address: string;
  } | null>(null);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<CouponData>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Pre-fill from logged-in customer profile
    fetch('/api/account/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          const c = data.customer;
          setForm((prev) => ({
            ...prev,
            email: c.email || prev.email,
            phone: c.phone || prev.phone,
            shippingName: c.shippingName || c.name || prev.shippingName,
            shippingZip: c.shippingZip || prev.shippingZip,
            shippingCity: c.shippingCity || prev.shippingCity,
            shippingAddress: c.shippingAddress || prev.shippingAddress,
            shippingNote: c.shippingNote || prev.shippingNote,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0 && !redirecting) {
      router.replace('/kosar');
    }
  }, [mounted, items.length, redirecting, router]);

  if (!mounted || (items.length === 0 && !redirecting)) return null;

  const subtotal = total();
  const shippingCost = SHIPPING_COSTS[shippingMethod];

  // Calculate discount
  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percent') {
      discount = Math.round(subtotal * (coupon.discountValue / 100));
    } else {
      discount = coupon.discountValue;
    }
    if (discount > subtotal) discount = subtotal;
  }

  const grandTotal = subtotal - discount + shippingCost;

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

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCoupon(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Érvénytelen kuponkód');
      } else {
        if (data.minOrderAmount && subtotal < data.minOrderAmount) {
          setCouponError(`Minimum rendelési összeg: ${formatPrice(data.minOrderAmount)}`);
        } else {
          setCoupon(data);
        }
      }
    } catch {
      setCouponError('Hálózati hiba');
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleSubmit() {
    setErrors({});

    // Require locker selection for parcel shipping
    if (shippingMethod === 'parcel' && !selectedLocker) {
      setErrors({ _form: 'Kérjük, válassz csomagautomatát a térkép segítségével.' });
      return;
    }

    const schema = shippingMethod === 'home' ? homeDeliverySchema : shippingSchema;
    const result = schema.safeParse(form);
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
        body: JSON.stringify({
          items,
          shipping: result.data,
          shippingMethod,
          couponCode: coupon?.code ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ _form: data.error || 'Hiba történt a rendelés során.' });
        setLoading(false);
        return;
      }

      setRedirecting(true);
      clearCart();
      window.location.href = data.url;
    } catch {
      setErrors({ _form: 'Hiba történt. Kérjük, próbáld újra.' });
      setLoading(false);
    }
  }

  const sectionTitle = "text-lg font-headline font-bold text-on-surface mb-4";

  return (
    <main className="min-h-screen bg-[#F7F3EE] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1
          className="text-3xl text-[#4A4A4A] tracking-wide mb-8"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
        >
          Pénztár
        </h1>

        {errors._form && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
            {errors._form}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column: Shipping + Payment */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Step 1: Contact info */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className={sectionTitle}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#4A4A4A] text-white text-xs mr-2">1</span>
                Kapcsolat
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Teljes név"
                  name="shippingName"
                  value={form.shippingName}
                  onChange={handleChange}
                  error={errors.shippingName}
                />
                <Input
                  label="E-mail cím"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <Input
                  label="Telefonszám"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
              </div>
            </section>

            {/* Step 2: Shipping method */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className={sectionTitle}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#4A4A4A] text-white text-xs mr-2">2</span>
                Szállítási mód
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setShippingMethod('parcel')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    shippingMethod === 'parcel'
                      ? 'border-[#C4A591] bg-[#C4A591]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      shippingMethod === 'parcel' ? 'border-[#C4A591]' : 'border-gray-300'
                    }`}>
                      {shippingMethod === 'parcel' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#C4A591]" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[#4A4A4A]">Csomagautomata</div>
                      <div className="text-xs text-[#4A4A4A]/60">Foxpost / Packeta</div>
                    </div>
                  </div>
                  <div className="mt-2 text-right font-semibold text-sm text-[#4A4A4A]">
                    {formatPrice(SHIPPING_COSTS.parcel)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod('home')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    shippingMethod === 'home'
                      ? 'border-[#C4A591] bg-[#C4A591]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      shippingMethod === 'home' ? 'border-[#C4A591]' : 'border-gray-300'
                    }`}>
                      {shippingMethod === 'home' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#C4A591]" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[#4A4A4A]">Házhozszállítás</div>
                      <div className="text-xs text-[#4A4A4A]/60">Foxpost futárszolgálat</div>
                    </div>
                  </div>
                  <div className="mt-2 text-right font-semibold text-sm text-[#4A4A4A]">
                    {formatPrice(SHIPPING_COSTS.home)}
                  </div>
                </button>
              </div>

              {/* Foxpost parcel locker selector */}
              {shippingMethod === 'parcel' && (
                <FoxpostSelector
                  selected={selectedLocker}
                  onSelect={(locker) => {
                    setSelectedLocker(locker);
                    // Store the place_id in shippingNote so the API can use it for Foxpost
                    setForm((prev) => ({
                      ...prev,
                      shippingAddress: `Foxpost: ${locker.name}`,
                      shippingNote: locker.place_id,
                    }));
                  }}
                />
              )}

              {/* Home delivery address */}
              {shippingMethod === 'home' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Irányítószám"
                    name="shippingZip"
                    value={form.shippingZip}
                    onChange={handleChange}
                    error={errors.shippingZip}
                  />
                  <Input
                    label="Város"
                    name="shippingCity"
                    value={form.shippingCity}
                    onChange={handleChange}
                    error={errors.shippingCity}
                  />
                  <Input
                    label="Utca, házszám"
                    name="shippingAddress"
                    value={form.shippingAddress}
                    onChange={handleChange}
                    error={errors.shippingAddress}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Megjegyzés (opcionális)"
                      name="shippingNote"
                      value={form.shippingNote}
                      onChange={handleChange}
                      error={errors.shippingNote}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Step 3: Payment (Stripe placeholder) */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className={sectionTitle}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#4A4A4A] text-white text-xs mr-2">3</span>
                Fizetés
              </h2>

              <div className="bg-[#F7F3EE] rounded-xl p-6">
                {/* Stripe card element placeholder */}
                <div className="border border-gray-200 rounded-lg bg-white p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[#4A4A4A]">Bankkártya</span>
                    <div className="flex gap-2">
                      {/* Card brand logos */}
                      <div className="w-10 h-6 bg-[#1A1F71] rounded flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                      <div className="w-10 h-6 bg-[#EB001B] rounded-full relative overflow-hidden">
                        <div className="absolute right-0 w-6 h-6 bg-[#F79E1B] rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Fake card input fields */}
                  <div className="space-y-3">
                    <div className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 flex items-center">
                      <span className="text-sm text-gray-400">1234 5678 9012 3456</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 flex items-center">
                        <span className="text-sm text-gray-400">HH/ÉÉ</span>
                      </div>
                      <div className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 flex items-center">
                        <span className="text-sm text-gray-400">CVC</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#4A4A4A]/50 text-center">
                  A fizetés a Stripe biztonságos rendszerén keresztül történik. A Stripe integrálása hamarosan.
                </p>

                <div className="flex items-center justify-center gap-3 mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs text-[#4A4A4A]/60">256-bit SSL titkosított kapcsolat</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right column: Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm lg:sticky lg:top-24 relative z-10">
              <h2 className={sectionTitle}>Rendelés összesítő</h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#4A4A4A] truncate">{item.name}</p>
                      {item.babyName && (
                        <p className="text-xs text-[#4A4A4A]/60">
                          {item.babyName}
                          {item.birthDate && ` · ${item.birthDate}`}
                        </p>
                      )}
                      <p className="text-xs text-[#4A4A4A]/60">{item.quantity} db</p>
                    </div>
                    <p className="font-medium text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kuponkód"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A591]/30"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!coupon}
                  />
                  {coupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCoupon(null);
                        setCouponCode('');
                        setCouponError('');
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Törlés
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[#D5E8F0] text-[#4A4A4A] hover:opacity-90 disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Beváltás'}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-1">{couponError}</p>
                )}
                {coupon && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {coupon.code} — {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)} kedvezmény
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-[#4A4A4A]/70">
                  <span>Részösszeg</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Kedvezmény ({coupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#4A4A4A]/70">
                  <span>Szállítás ({shippingMethod === 'parcel' ? 'Csomagautomata' : 'Házhozszállítás'})</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 text-[#4A4A4A]">
                  <span>Összesen</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {errors._form && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mt-4 text-sm">
                  {errors._form}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-4 bg-[#4A4A4A] text-white py-3.5 rounded-xl font-medium text-sm hover:bg-[#3A3A3A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Feldolgozás...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Megrendelés — {formatPrice(grandTotal)}
                  </>
                )}
              </button>

              <p className="text-[10px] text-[#4A4A4A]/40 text-center mt-3">
                A megrendelés gomb megnyomásával elfogadod az Általános Szerződési Feltételeket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
