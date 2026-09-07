'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { isBlobImage, variantSrcSet, variantUrl } from '@/lib/imageVariants';

type Props = {
  src: string;
  alt: string;
  /** Ugyanaz, mint a next/image `sizes` — a böngésző ebből választ szélességet. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  onLoad?: () => void;
};

/**
 * Kitöltő (fill) termékkép. Blobban tárolt képnél az előre legyártott
 * AVIF/WebP változatokat adja közvetlenül a tárhelyről (srcset, a Next
 * optimalizálója nélkül); minden más forrásnál (public mappa, külső URL)
 * a megszokott next/image marad.
 *
 * Biztonsági háló: ha egy változat mégsem tölthető be (pl. régi kép, amihez
 * még nem készült), a kép hibája után visszaváltunk a next/image útra.
 */
export default function ProductImage({ src, alt, sizes, className = '', style, priority, onLoad }: Props) {
  const [legacy, setLegacy] = useState(false);

  if (!isBlobImage(src) || legacy) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        style={style}
        priority={priority}
        onLoad={onLoad}
      />
    );
  }

  return (
    <picture>
      <source type="image/avif" srcSet={variantSrcSet(src, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={variantSrcSet(src, 'webp')} sizes={sizes} />
      <img
        src={variantUrl(src, 1080, 'webp')}
        alt={alt}
        sizes={sizes}
        className={`absolute inset-0 w-full h-full ${className}`}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={onLoad}
        onError={() => setLegacy(true)}
      />
    </picture>
  );
}
