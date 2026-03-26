"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/products";

const SHIPPING_COST = 1490;
const FREE_SHIPPING_THRESHOLD = 15000;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    note: "",
  });

  const subtotal = totalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            customData: item.customData,
          })),
          shipping: shippingData,
          total,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        clearCart();
        router.push("/koszonjuk");
      } else {
        toast.error("Hiba történt a fizetés során.");
      }
    } catch {
      toast.error("Hiba történt, próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pt-20 bg-warm-beige min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl text-carbon mb-4">
              A kosarad üres
            </h1>
            <Link
              href="/"
              className="text-terracotta hover:text-terracotta-dark transition-colors"
            >
              Vissza a termékekhez →
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-warm-beige min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/kosar"
            className="inline-flex items-center gap-2 text-sm text-carbon-light hover:text-terracotta transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Vissza a kosárhoz
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-4 mb-12">
            {[
              { key: "shipping", label: "Szállítás", icon: Truck },
              { key: "payment", label: "Fizetés", icon: CreditCard },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-4">
                {i > 0 && (
                  <div
                    className={`w-16 h-[1px] ${
                      step === "payment"
                        ? "bg-terracotta"
                        : "bg-terracotta/20"
                    }`}
                  />
                )}
                <motion.div
                  animate={{
                    backgroundColor:
                      step === s.key ||
                      (step === "payment" && s.key === "shipping")
                        ? "#C4A591"
                        : "#F5F0E8",
                    color:
                      step === s.key ||
                      (step === "payment" && s.key === "shipping")
                        ? "#FFFFFF"
                        : "#4A4A4A",
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                >
                  <s.icon size={16} />
                  {s.label}
                </motion.div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              {step === "shipping" ? (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleShippingSubmit}
                  className="space-y-6"
                >
                  <h2 className="font-display text-xl text-carbon mb-4">
                    Szállítási adatok
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        name: "lastName",
                        label: "Vezetéknév",
                        required: true,
                      },
                      {
                        name: "firstName",
                        label: "Keresztnév",
                        required: true,
                      },
                      {
                        name: "email",
                        label: "E-mail",
                        type: "email",
                        required: true,
                      },
                      {
                        name: "phone",
                        label: "Telefonszám",
                        type: "tel",
                        required: true,
                      },
                      {
                        name: "zip",
                        label: "Irányítószám",
                        required: true,
                      },
                      { name: "city", label: "Város", required: true },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-xs text-carbon-light mb-1">
                          {field.label}{" "}
                          {field.required && (
                            <span className="text-accent-red">*</span>
                          )}
                        </label>
                        <input
                          type={field.type || "text"}
                          required={field.required}
                          value={
                            shippingData[
                              field.name as keyof typeof shippingData
                            ]
                          }
                          onChange={(e) =>
                            setShippingData({
                              ...shippingData,
                              [field.name]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-warm-beige-dark border border-terracotta/10 rounded-xl text-sm focus:outline-none focus:border-terracotta/30 transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs text-carbon-light mb-1">
                      Cím <span className="text-accent-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.address}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-warm-beige-dark border border-terracotta/10 rounded-xl text-sm focus:outline-none focus:border-terracotta/30 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-carbon-light mb-1">
                      Megjegyzés (opcionális)
                    </label>
                    <textarea
                      rows={3}
                      value={shippingData.note}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          note: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-warm-beige-dark border border-terracotta/10 rounded-xl text-sm focus:outline-none focus:border-terracotta/30 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-terracotta text-white text-sm font-medium rounded-full hover:bg-terracotta-dark transition-all duration-300 hover:shadow-xl"
                  >
                    Tovább a fizetéshez
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="font-display text-xl text-carbon mb-4">
                    Fizetés
                  </h2>

                  <div className="bg-warm-beige-dark rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-terracotta" />
                      <span className="text-sm text-carbon">
                        Biztonságos fizetés Stripe-on keresztül
                      </span>
                    </div>
                    <p className="text-xs text-carbon-light">
                      A fizetés a Stripe biztonságos felületén történik. Bankkártya
                      adataid nem kerülnek hozzánk.
                    </p>
                  </div>

                  <div className="bg-warm-beige-dark rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-carbon mb-3">
                      Szállítási cím
                    </h3>
                    <p className="text-sm text-carbon-light">
                      {shippingData.lastName} {shippingData.firstName}
                      <br />
                      {shippingData.zip} {shippingData.city},{" "}
                      {shippingData.address}
                      <br />
                      {shippingData.email} | {shippingData.phone}
                    </p>
                    <button
                      onClick={() => setStep("shipping")}
                      className="mt-2 text-xs text-terracotta hover:text-terracotta-dark transition-colors"
                    >
                      Módosítás
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-4 bg-carbon text-white text-sm font-medium rounded-full hover:bg-carbon-light transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    {loading
                      ? "Feldolgozás..."
                      : `Fizetés – ${formatPrice(total)}`}
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-warm-beige-dark rounded-2xl p-6 sticky top-24">
                <h2 className="font-display text-lg font-medium text-carbon mb-4">
                  Rendelésed
                </h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-carbon-light">
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-terracotta/10 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-carbon-light">Részösszeg</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-carbon-light">Szállítás</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-terracotta">Ingyenes</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-terracotta/10 pt-2 flex justify-between font-medium">
                    <span>Összesen</span>
                    <span className="text-terracotta">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
