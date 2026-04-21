'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { shippingSchema, homeDeliverySchema, type ShippingData } from '@/lib/validators';
import { formatPrice } from '@/lib/utils';
import { cartRequiresShipping } from '@/lib/shippingRules';
import Input from '@/components/ui/Input';
import FoxpostSelector from '@/components/checkout/FoxpostSelector';

type ShippingMethod = 'parcel' | 'home';
type CouponData = {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  description: string;
  freeShippingOnParcel?: boolean;
} | null;

const SHIPPING_COSTS: Record<ShippingMethod, number> = {
  parcel: 1190,
  home: 2490,
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('parcel');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [altPaymentOpen, setAltPaymentOpen] = useState(false);
  const [form, setForm] = useState<ShippingData>({
    email: '',
    phone: '',
    shippingName: '',
    shippingZip: '',
    shippingCity: '',
    shippingAddress: '',
    shippingNote: '',
    billingZip: '',
    billingCity: '',
    billingAddress: '',
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
    fetch('/api/account/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          const c = data.customer;
          setIsLoggedIn(true);
          setForm((prev) => ({
            ...prev,
            email: c.email || prev.email,
            phone: c.phone || prev.phone,
            shippingName: c.shippingName || c.name || prev.shippingName,
            shippingZip: c.shippingZip || prev.shippingZip,
            shippingCity: c.shippingCity || prev.shippingCity,
            shippingAddress: c.shippingAddress || prev.shippingAddress,
            shippingNote: c.shippingNote || prev.shippingNote,
            billingZip: c.billingZip || prev.billingZip,
            billingCity: c.billingCity || prev.billingCity,
            billingAddress: c.billingAddress || prev.billingAddress,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Zip-to-city auto-fill for billing
  const lookupCity = useCallback(async (zip: string, field: 'billingCity' | 'shippingCity') => {
    if (zip.length !== 4) return;
    try {
      const res = await fetch(`/api/zip-to-city?zip=${zip}`);
      const data = await res.json();
      if (data.city) {
        setForm((prev) => ({ ...prev, [field]: data.city }));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0 && !redirecting) {
      router.replace('/kosar');
    }
  }, [mounted, items.length, redirecting, router]);

  if (!mounted || (items.length === 0 && !redirecting)) return null;

  const subtotal = total();
  const needsShipping = cartRequiresShipping(items);
  const baseShippingCost = needsShipping ? SHIPPING_COSTS[shippingMethod] : 0;

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percent') {
      discount = Math.round(subtotal * (coupon.discountValue / 100));
    } else {
      discount = coupon.discountValue;
    }
    if (discount > subtotal) discount = subtotal;
  }

  const freeShippingApplied = Boolean(
    coupon?.freeShippingOnParcel && shippingMethod === 'parcel' && needsShipping,
  );
  const shippingCost = freeShippingApplied ? 0 : baseShippingCost;

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
    // Auto-lookup city for billing zip
    if (name === 'billingZip' && value.length === 4) {
      lookupCity(value, 'billingCity');
    }
    // Auto-lookup city for shipping zip (home delivery)
    if (name === 'shippingZip' && value.length === 4) {
      lookupCity(value, 'shippingCity');
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

    if (!termsAccepted) {
      setErrors({ _form: 'A rendelés leadásához el kell fogadnod az Általános Szerződési Feltételeket.' });
      return;
    }

    if (needsShipping && shippingMethod === 'parcel' && !selectedLocker) {
      setErrors({ _form: 'Kérjük, válassz csomagautomatát a térkép segítségével.' });
      return;
    }

    // Copy shipping to billing if checkbox is on
    const formToValidate = needsShipping && shippingSameAsBilling && shippingMethod === 'home'
      ? { ...form, billingZip: form.shippingZip, billingCity: form.shippingCity, billingAddress: form.shippingAddress }
      : form;

    const schema = needsShipping && shippingMethod === 'home' ? homeDeliverySchema : shippingSchema;
    const result = schema.safeParse(formToValidate);
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
          shippingMethod: needsShipping ? shippingMethod : 'parcel',
          paymentMethod,
          couponCode: coupon?.code ?? null,
          saveData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ _form: data.error || 'Hiba történt a rendelés során.' });
        setLoading(false);
        return;
      }

      // Cart is intentionally NOT cleared here: if the user backs out of
      // Stripe, they return to /penztar and should see their items still
      // in the cart. /koszonjuk clears the cart once the order succeeds.
      setRedirecting(true);
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
          {/* Left column */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Step 1: Contact info */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className={sectionTitle}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D5E8F0] text-[#4A4A4A] text-xs mr-2 font-semibold">1</span>
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

            {/* Step 2: Billing address */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className={sectionTitle}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D5E8F0] text-[#4A4A4A] text-xs mr-2 font-semibold">2</span>
                Számlázási cím
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Irányítószám"
                  name="billingZip"
                  value={form.billingZip}
                  onChange={handleChange}
                  error={errors.billingZip}
                  maxLength={4}
                  inputMode="numeric"
                />
                <Input
                  label="Város"
                  name="billingCity"
                  value={form.billingCity}
                  onChange={handleChange}
                  error={errors.billingCity}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Utca, házszám"
                    name="billingAddress"
                    value={form.billingAddress}
                    onChange={handleChange}
                    error={errors.billingAddress}
                  />
                </div>
              </div>
            </section>

            {/* Step 3: Shipping method — hidden for fully digital orders */}
            {needsShipping && (
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className={sectionTitle}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D5E8F0] text-[#4A4A4A] text-xs mr-2 font-semibold">3</span>
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

              {shippingMethod === 'parcel' && (
                <FoxpostSelector
                  selected={selectedLocker}
                  onSelect={(locker) => {
                    setSelectedLocker(locker);
                    setForm((prev) => ({
                      ...prev,
                      shippingAddress: `Foxpost: ${locker.name}`,
                      shippingNote: locker.place_id,
                    }));
                  }}
                />
              )}

              {shippingMethod === 'home' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Irányítószám"
                    name="shippingZip"
                    value={form.shippingZip}
                    onChange={handleChange}
                    error={errors.shippingZip}
                    maxLength={4}
                    inputMode="numeric"
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
                  <div className="md:col-span-2 mt-1">
                    <label className="flex items-center gap-2 text-sm text-[#4A4A4A] font-body cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shippingSameAsBilling}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setShippingSameAsBilling(checked);
                          if (checked) {
                            setForm((prev) => ({
                              ...prev,
                              billingZip: prev.shippingZip,
                              billingCity: prev.shippingCity,
                              billingAddress: prev.shippingAddress,
                            }));
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-[#C4A591] focus:ring-[#C4A591]/30"
                      />
                      A számlázási cím megegyezik a szállítási címmel
                    </label>
                  </div>
                </div>
              )}
            </section>
            )}

            {/* Payment info (step 3 for digital-only orders, 4 otherwise) */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className={sectionTitle}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D5E8F0] text-[#4A4A4A] text-xs mr-2 font-semibold">{needsShipping ? 4 : 3}</span>
                Fizetés
              </h2>

              <div className="bg-[#F7F3EE] rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium text-[#4A4A4A]">Biztonságos online fizetés</span>
                </div>
                <p className="text-xs text-[#4A4A4A]/60 mb-3">
                  {paymentMethod === 'card' ? (
                    <>A &quot;Megrendelés&quot; gomb megnyomása után átirányítunk a Stripe biztonságos fizetési oldalára, ahol bankkártyával fizethetsz.</>
                  ) : (
                    <>A &quot;Megrendelés&quot; gomb megnyomása után rögzítjük a rendelést, az utaláshoz szükséges adatokat e-mailben küldjük el.</>
                  )}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-6 bg-[#1A1F71] rounded flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                  <div className="w-10 h-6 bg-[#EB001B] rounded-full relative overflow-hidden">
                    <div className="absolute right-0 w-6 h-6 bg-[#F79E1B] rounded-full" />
                  </div>
                  <div className="w-10 h-6 bg-[#635BFF] rounded flex items-center justify-center text-white text-[7px] font-bold tracking-tight">stripe</div>
                  <div className="w-10 h-6 bg-black rounded flex items-center justify-center gap-[1px] text-white">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor" aria-hidden="true">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <span className="text-[7px] font-semibold leading-none">Pay</span>
                  </div>
                </div>
              </div>

              {/* Alternative payment methods (collapsible) */}
              <div className="mt-4 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setAltPaymentOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-sm font-medium text-[#4A4A4A]/80 hover:text-[#4A4A4A] py-1"
                  aria-expanded={altPaymentOpen}
                >
                  <span>Alternatív fizetési módok</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transition-transform duration-200 ${altPaymentOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {altPaymentOpen && (
                  <div className="mt-3 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentMethod === 'transfer'}
                        onChange={(e) => setPaymentMethod(e.target.checked ? 'transfer' : 'card')}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#C4A591] focus:ring-[#C4A591]/30"
                      />
                      <span className="text-sm text-[#4A4A4A]">Banki átutalás</span>
                    </label>
                    <p className="text-xs text-[#4A4A4A]/60 leading-relaxed pl-7">
                      Banki átutalás esetén az átutaláshoz szükséges adatokat a visszaigazoló e-mailben küldjük el.
                      A termék elkészítése és postázása az utalás beérkezését követően történik.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Save data checkbox */}
            {!isLoggedIn && (
              <section className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveData}
                    onChange={(e) => setSaveData(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#C4A591] focus:ring-[#C4A591]/30"
                  />
                  <div>
                    <span className="text-sm font-medium text-[#4A4A4A]">
                      Adataim mentése későbbi rendelésekhez
                    </span>
                    <p className="text-xs text-[#4A4A4A]/60 mt-1">
                      A megadott e-mail címmel létrehozunk egy fiókot, így legközelebb nem kell újra kitöltened az adataidat.
                    </p>
                  </div>
                </label>
              </section>
            )}
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
                      {item.posterLayoutLabel && (
                        <p className="text-xs text-[#4A4A4A]/60">
                          Dizájn: {item.posterLayoutLabel}
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
                {needsShipping && (
                  <div className="flex justify-between text-[#4A4A4A]/70">
                    <span>Szállítás ({shippingMethod === 'parcel' ? 'Csomagautomata' : 'Házhozszállítás'})</span>
                    {freeShippingApplied ? (
                      <span>
                        <span className="line-through text-[#4A4A4A]/40 mr-2">{formatPrice(baseShippingCost)}</span>
                        <span className="text-green-600">Ingyenes (kupon)</span>
                      </span>
                    ) : (
                      <span>{formatPrice(shippingCost)}</span>
                    )}
                  </div>
                )}
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

              <label className="flex items-start gap-2 mt-4 text-xs text-[#4A4A4A] font-body cursor-pointer leading-relaxed">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#C4A591] focus:ring-[#C4A591]/30 flex-shrink-0"
                />
                <span>
                  A megrendelés véglegesítésével elfogadom a{' '}
                  <a
                    href="/aszf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#C4A591]"
                  >
                    Általános Szerződési Feltételeket
                  </a>
                  {' '}és tudomásul veszem, hogy a megrendelés fizetési kötelezettséget von maga után.
                </span>
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !termsAccepted}
                className="w-full mt-4 bg-[#D5E8F0] text-[#4A4A4A] py-3.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-[#4A4A4A] border-t-transparent rounded-full animate-spin" />
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
