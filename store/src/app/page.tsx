"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import HowItWorks from "@/components/HowItWorks";
import TargetAudience from "@/components/TargetAudience";
import PosterSection from "@/components/PosterSection";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import NewsletterBanner from "@/components/NewsletterBanner";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Home() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <Hero />
        <ProductGrid />
        <HowItWorks />
        <TargetAudience />
        <PosterSection />
        <Features />
        <FAQ />
        <NewsletterBanner />
        <InstagramFeed />
      </main>
      <Footer />
    </>
  );
}
