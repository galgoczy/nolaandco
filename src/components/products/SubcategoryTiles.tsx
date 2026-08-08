import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { prisma } from '@/lib/prisma';

/**
 * Alkategória-kártyák a gyűjtő kategóriaoldalak tetején (KICSIKNEK / NAGYOKNAK).
 * Ugyanaz a méret és 1:1 képarány, mint a főoldali kategória-kártyáknál.
 * A képek adminból tölthetők fel (Kategóriák → kategóriakép); amíg nincs kép,
 * a kártya semleges felülettel jelenik meg.
 */
export default async function SubcategoryTiles({ parent }: { parent: string }) {
  const categories = await prisma.category.findMany({
    where: { parent },
    orderBy: { sortOrder: 'asc' },
  });

  if (categories.length < 2) return null;

  return (
    <div className="mb-10 md:mb-14">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        {categories.map((cat, i) => (
          <RevealOnScroll key={cat.id} delay={i * 100}>
            <Link
              href={`/termekek?category=${cat.slug}`}
              className="group block cursor-pointer card-hover"
            >
              <div className="relative aspect-square rounded-sm overflow-hidden bg-surface-container-low ghost-border mb-3 md:mb-4">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 767px) 50vw, (max-width: 1280px) 33vw, 400px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#EFEAE2] text-carbon-light/50 text-[10px] tracking-[0.2em] uppercase">
                    Fotó hamarosan
                  </div>
                )}
              </div>
              <p className="text-center text-sm md:text-lg tracking-[0.08em] text-carbon uppercase">
                {cat.name}
              </p>
            </Link>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
