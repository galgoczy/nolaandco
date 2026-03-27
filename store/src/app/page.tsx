"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import HowItWorks from "@/components/HowItWorks";
import TargetAudience from "@/components/TargetAudience";
import Features from "@/components/Features";
import PosterSection from "@/components/PosterSection";
import GiftCardSection from "@/components/GiftCardSection";
import FAQ from "@/components/FAQ";
import NewsletterBanner from "@/components/NewsletterBanner";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Home() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        {/* 1 - Navbar (above) */}
        {/* 2 - Hero with baby photo */}
        <Hero />
        {/* 3 - Product grid 3x2 */}
        <ProductGrid />
        {/* 4 - Three steps (terracotta bg) */}
        <HowItWorks />
        {/* 5 - Target audience bento */}
        <TargetAudience />
        {/* 6 - How it's made (terracotta bg, tilted photos) */}
        <Features />
        {/* 7 - Posters section */}
        <PosterSection />
        {/* 8 - Gift card / featured product */}
        <GiftCardSection />
        {/* 9 - FAQ cards */}
        <FAQ />
        {/* 10 - Newsletter CTA (terracotta bg) */}
        <NewsletterBanner />
      </main>
      {/* 11 - Footer */}
      <Footer />
    </>
  );
}
