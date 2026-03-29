'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden leading-[0]">
      <div className="w-full relative">
        <Image
          src="/images/hero-image.png"
          alt="Nola & Co Hero"
          width={1920}
          height={800}
          priority
          className="hero-img w-full h-auto object-cover"
        />
        <div className="absolute inset-0 flex pointer-events-none items-center justify-start px-8 md:px-32">
          <Link
            href="/termekek"
            className="hero-cta pointer-events-auto bg-brand-blue text-carbon rounded-full px-14 py-5 text-lg font-bold tracking-wide btn-anim shadow-xl"
          >
            Fedezd fel a kollekciót
          </Link>
        </div>
      </div>
    </section>
  );
}
