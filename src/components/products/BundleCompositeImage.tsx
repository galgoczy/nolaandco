import Image from 'next/image';

/**
 * Csomagok automatikus mozaik-fotója: a tagtermékek fő képei függőleges
 * osztással, vékony elválasztóval egymás mellett. A csomag tartalmának
 * változásával (admin: "Csomag tartalma") magától követi az összetételt;
 * kézzel feltöltött fő kép esetén nem ez jelenik meg.
 */
export default function BundleCompositeImage({
  images,
  alt,
  sizes,
}: {
  images: string[];
  alt: string;
  sizes: string;
}) {
  return (
    <div className="absolute inset-0 flex gap-[2px] bg-white">
      {images.map((src, i) => (
        <div key={`${src}-${i}`} className="relative flex-1 overflow-hidden">
          <Image
            src={src}
            alt={i === 0 ? alt : ''}
            aria-hidden={i !== 0}
            fill
            className="object-cover"
            sizes={sizes}
          />
        </div>
      ))}
    </div>
  );
}
