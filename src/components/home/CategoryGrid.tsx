import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { getSiteImages } from '@/lib/siteImages';

type CategoryTile = {
  label: string;
  imageUrl: string;
  href?: string; // no href = placeholder tile (not clickable yet)
};

/** BLOKK 2: Vásárolj kategória szerint — 3 oszlopos, 1:1 képes rács.
 * A képek adminból cserélhetők (Megjelenés → Főoldal – kategória-kártyák). */
export default async function CategoryGrid({ t }: { t: Record<string, string> }) {
  const imgs = await getSiteImages([
    'home-kategoria-emlekorzok',
    'home-kategoria-textilek',
    'home-kategoria-dekoracio',
  ]);
  const tiles: CategoryTile[] = [
    {
      label: t['kategoria-1-felirat'],
      imageUrl: imgs['home-kategoria-emlekorzok'],
      href: '/termekek?category=emlekorzok',
    },
    {
      label: t['kategoria-2-felirat'],
      imageUrl: imgs['home-kategoria-textilek'],
      href: '/termekek?category=textilek',
    },
    {
      label: t['kategoria-3-felirat'],
      imageUrl: imgs['home-kategoria-dekoracio'],
      href: '/termekek?category=dekoracio',
    },
  ];
  return (
    <section className="py-10 md:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h2 className="text-2xl md:text-4xl text-carbon text-center mb-8 md:mb-12 tracking-[0.1em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
          {t['kategoriak-cim']}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {tiles.map((tile, i) => {
            const card = (
              <>
                <div className="relative aspect-square rounded-sm overflow-hidden bg-surface-container-low ghost-border mb-4">
                  <Image
                    src={tile.imageUrl}
                    alt={tile.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 767px) 100vw, (max-width: 1280px) 33vw, 400px"
                  />
                </div>
                <p className="text-center text-base md:text-lg tracking-[0.08em] text-carbon uppercase">
                  {tile.label}
                </p>
              </>
            );

            return (
              <RevealOnScroll key={tile.label} delay={i * 100}>
                {tile.href ? (
                  <Link href={tile.href} className="group block cursor-pointer card-hover">
                    {card}
                  </Link>
                ) : (
                  <div className="group block">{card}</div>
                )}
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
