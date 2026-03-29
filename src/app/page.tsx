import HeroSection from '@/components/home/HeroSection';
import ProductGrid from '@/components/home/ProductGrid';
import CraftingSection from '@/components/home/CraftingSection';
import PostersSection from '@/components/home/PostersSection';
import FaqSection from '@/components/home/FaqSection';
import FeaturedProduct from '@/components/home/FeaturedProduct';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ProductGrid />
      <CraftingSection />
      <PostersSection />
      <FaqSection />
      <FeaturedProduct />
    </main>
  );
}
