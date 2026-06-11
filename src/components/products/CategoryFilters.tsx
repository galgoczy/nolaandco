import Link from 'next/link';

const CATEGORY_FILTER_LABELS: Record<string, string> = {
  pillow: 'PÁRNA',
  poster: 'POSZTER',
  giftcard: 'AJÁNDÉKKÁRTYA',
};

type CategoryOption = {
  slug: string;
  name: string;
};

/**
 * Flat text-only category filter used on /termekek and on the gift card
 * product page. No bubbles, uppercase, thin weight, 20% smaller than the
 * section heading ("Párnák") shown below it.
 */
export default function CategoryFilters({
  categories,
  active,
}: {
  categories: CategoryOption[];
  active: string | null;
}) {
  const cls = (isActive: boolean) =>
    `text-sm md:text-base tracking-[0.25em] uppercase transition-colors ${
      isActive ? 'text-carbon' : 'text-carbon-light/70 hover:text-carbon'
    }`;

  return (
    <nav className="flex items-center justify-center gap-5 md:gap-8 flex-wrap">
      <Link
        href="/termekek"
        className={cls(!active)}
        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
      >
        ÖSSZES
      </Link>
      {categories.map((cat) => {
        const isActive = active === cat.slug;
        const label = CATEGORY_FILTER_LABELS[cat.slug] ?? cat.name.toUpperCase();
        return (
          <Link
            key={cat.slug}
            href={`/termekek?category=${cat.slug}`}
            className={cls(isActive)}
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
