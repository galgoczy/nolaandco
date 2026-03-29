import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function FeaturedProduct() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Pillow image */}
          <div className="relative order-2 lg:order-1">
            <div className="breathe-glow bg-brand-blue/20 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida/ADBb0uhDk5QjpY9yJ-d8GhhGRtlbgme7FJ6HcDCT_pwpZ83tMDJAAHRotaz3n_-Ba15nOoA6onzDKTZp7KKKaczSmYfxuXu0ZRF7J2UOnprb8mEfQl2CDOHKJhgxq4SOuVNvzbUueIbzdbTm2k5tHGCt413AEKlOK9KrdZzboWxwTkT1uJM8XJJ4gOe2mUZmpG-PU6IyxcExo0X0EeCEYHG8Wm6VLkJaONR5nYPF0tx8eSmjmFcz8_hrEgEdU8NRU9aGhN-BAWw-Jd1rC4k"
                alt="Nola & Co Signature Pillow"
                width={800}
                height={800}
                className="float-anim w-full h-auto object-contain relative z-10"
              />
            </div>
          </div>

          {/* Right: Text content */}
          <div className="order-1 lg:order-2 space-y-8">
            <RevealOnScroll>
              <h3 className="text-5xl md:text-6xl font-headline text-carbon leading-tight uppercase tracking-tight">
                SZEREZD MEG A NOLA CORE-T
              </h3>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light text-lg font-light leading-relaxed">
                Tapasztald meg a prémium minőségű kézműves munkát.
              </p>
            </RevealOnScroll>
            <div className="pt-4">
              <p className="text-4xl font-light text-carbon mb-8">14 990 Ft</p>
              <Link
                href="/termekek/origin-core"
                className="bg-brand-blue text-carbon px-16 py-5 rounded-full text-lg font-bold tracking-wide btn-anim shadow-xl inline-block"
              >
                Megvásárolom
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
