import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

type CategoryTile = {
  label: string;
  imageUrl: string;
  href?: string; // no href = placeholder tile (not clickable yet)
};

const tiles: CategoryTile[] = [
  {
    label: 'Kicsikről',
    imageUrl: '/images/home/kategoria-kicsikrol.jpg',
    href: '/termekek?category=kicsiknek',
  },
  {
    label: 'Nagyoknak',
    imageUrl: '/images/home/kategoria-nagyoknak.jpg',
    href: '/termekek?category=nagyoknak',
  },
  {
    label: 'NOLA válogatások',
    imageUrl: '/images/home/kategoria-valogatasok.jpg',
    href: '/termekek?category=bundle',
  },
];

/** BLOKK 2: Vásárolj kategória szerint — 3 oszlopos, 1:1 képes rács. */
export default function CategoryGrid() {
  return (
    <section className="py-12 md:py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h2 className="text-2xl md:text-4xl text-carbon text-center mb-8 md:mb-12 tracking-[0.1em]" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
          Vásárolj kategória szerint
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
                    sizes="(max-width: 768px) 90vw, 30vw"
                  />
                </div>
                <p className="text-center text-base md:text-lg tracking-[0.08em] text-carbon">
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
