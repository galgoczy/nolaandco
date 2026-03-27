"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { getProductBySlug, formatPrice, products } from "@/lib/products";
import { useCartStore } from "@/store/cart";
import ProductCard from "@/components/ProductCard";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const { addItem, setCartOpen } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"details" | "shipping">("details");

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-beige">
        <div className="text-center">
          <h1 className="font-display text-3xl text-carbon mb-4">
            Termék nem található
          </h1>
          <Link
            href="/"
            className="text-terracotta hover:text-terracotta-dark transition-colors"
          >
            Vissza a főoldalra →
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.customizable) {
      const missingFields = product.customFields
        .filter((f) => f.required && !customData[f.name])
        .map((f) => f.label);

      if (missingFields.length > 0) {
        toast.error(`Kérjük, töltsd ki: ${missingFields.join(", ")}`);
        return;
      }
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      customData,
      style: product.style,
    });
    toast.success("Hozzáadva a kosárhoz!");
    setCartOpen(true);
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="pt-20 bg-warm-beige min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-carbon-light hover:text-terracotta transition-colors"
            >
              <ArrowLeft size={16} />
              Vissza a termékekhez
            </Link>
          </motion.div>
        </div>

        {/* Product */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-square bg-warm-beige-dark rounded-3xl overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full flex items-center justify-center p-12"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </motion.div>
                {/* Category badge */}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs tracking-wider uppercase text-carbon-light">
                    {product.category === "parna" ? "Párna" : "Poszter"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-xs tracking-[0.3em] uppercase text-terracotta font-light">
                {product.style}
              </span>
              <h1 className="font-display text-3xl lg:text-4xl text-carbon mt-2">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-semibold text-terracotta">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-carbon-light/50 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-sm text-carbon-light font-light leading-relaxed mt-6">
                {product.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mt-6">
                {product.features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terracotta/5 rounded-full text-xs text-carbon-light"
                  >
                    <Check size={12} className="text-terracotta" />
                    {f}
                  </span>
                ))}
              </div>

              {/* Custom fields */}
              {product.customizable && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-medium text-carbon">
                    Születési adatok
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.customFields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-xs text-carbon-light mb-1">
                          {field.label}
                          {field.required && (
                            <span className="text-accent-red ml-0.5">*</span>
                          )}
                        </label>
                        <input
                          type={field.type === "date" ? "date" : "text"}
                          placeholder={field.placeholder}
                          value={customData[field.name] || ""}
                          onChange={(e) =>
                            setCustomData({
                              ...customData,
                              [field.name]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-warm-beige-dark border border-terracotta/10 rounded-xl text-sm text-carbon placeholder:text-carbon-light/40 focus:outline-none focus:border-terracotta/30 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add to cart */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center bg-warm-beige-dark rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:text-terracotta transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:text-terracotta transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-terracotta text-white text-sm font-medium rounded-full hover:bg-terracotta-dark transition-all duration-300 hover:shadow-xl hover:shadow-terracotta/20"
                >
                  <ShoppingBag size={18} />
                  Kosárba
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-warm-beige-dark rounded-full flex items-center justify-center hover:text-accent-red transition-colors"
                >
                  <Heart size={18} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-warm-beige-dark rounded-full flex items-center justify-center hover:text-terracotta transition-colors"
                >
                  <Share2 size={18} />
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="mt-10 border-t border-terracotta/10 pt-6">
                <div className="flex gap-6 mb-4">
                  {(["details", "shipping"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm pb-2 border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-terracotta text-carbon"
                          : "border-transparent text-carbon-light hover:text-carbon"
                      }`}
                    >
                      {tab === "details" ? "Részletek" : "Szállítás"}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-carbon-light font-light leading-relaxed"
                  >
                    {activeTab === "details" ? (
                      <div className="space-y-2">
                        <p>
                          <strong className="text-carbon font-medium">Méret:</strong>{" "}
                          {product.dimensions}
                        </p>
                        {product.material && (
                          <p>
                            <strong className="text-carbon font-medium">Anyag:</strong>{" "}
                            {product.material}
                          </p>
                        )}
                        <p>
                          <strong className="text-carbon font-medium">Elkészítés:</strong>{" "}
                          5-7 munkanap
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>GLS futárszolgálattal szállítunk, 1-2 munkanap.</p>
                        <p>15 000 Ft feletti rendelésnél ingyenes szállítás!</p>
                        <p>Szállítási díj: 1 490 Ft</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="font-display text-2xl text-carbon mb-8 text-center">
                Kapcsolódó termékek
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
