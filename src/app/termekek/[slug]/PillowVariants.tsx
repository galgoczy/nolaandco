import Link from 'next/link';
import Image from 'next/image';

type PillowThumb = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
};

export default function PillowVariants({
  variants,
  currentSlug,
}: {
  variants: PillowThumb[];
  currentSlug: string;
}) {
  if (variants.length === 0) return null;

  return (
    <div className="bg-[#faf6f1] rounded-2xl p-6 md:p-8">
      <h3
        className="text-[11px] uppercase tracking-[0.2em] text-carbon-light mb-4"
        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}
      >
        További változatok
      </h3>
      <div className="flex gap-3 flex-wrap">
        {variants.map((p) => {
          const active = p.slug === currentSlug;
          return (
            <Link
              key={p.id}
              href={`/termekek/${p.slug}`}
              aria-label={p.name}
              title={p.name}
              className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                active
                  ? 'border-[#C4A591] shadow-sm scale-105 cursor-default'
                  : 'border-[#4A4A4A]/15 hover:border-[#C4A591] hover:scale-105'
              }`}
            >
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                className="object-cover"
                style={{ objectPosition: 'top' }}
                sizes="56px"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
