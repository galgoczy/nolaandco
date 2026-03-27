"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Features from "@/components/Features";
import PosterSection from "@/components/PosterSection";
import FAQ from "@/components/FAQ";
import GiftCardSection from "@/components/GiftCardSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Home() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        {/* Hero with baby photo */}
        <Hero />
        {/* Product grid 3x2 */}
        <ProductGrid />
        {/* Crafting section - Hogyan Készül? */}
        <Features />
        {/* Posters section */}
        <PosterSection />
        {/* FAQ cards */}
        <FAQ />
        {/* Featured product block */}
        <GiftCardSection />
      </main>
      {/* Footer */}
      <Footer />
    </>
  );
}
