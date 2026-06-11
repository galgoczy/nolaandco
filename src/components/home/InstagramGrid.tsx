import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const INSTAGRAM_URL = 'https://www.instagram.com/nolaandco.baby/';

// Kézzel válogatott képek — később dinamikus Instagram-feedre cserélhető.
const images = [
  '/testimonials/testimonial-1.jpg',
  '/testimonials/testimonial-2.jpg',
  '/testimonials/testimonial-3.jpg',
  '/testimonials/testimonial-4.jpg',
];

/** BLOKK 8: Instagram-rács — a profilra mutató képes ráccsal. */
export default function InstagramGrid() {
  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <RevealOnScroll>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl text-carbon text-center mb-3 tracking-[0.04em]"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            A ti történeteitek, a mi emlékeink. 🤍
          </h2>
        </RevealOnScroll>
        <RevealOnScroll>
          <p className="text-center mb-10 md:mb-12">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C4A591] hover:text-[#4A4A4A] transition-colors font-medium tracking-[0.08em]"
            >
              Kövess minket: @nolaandco.baby
            </a>
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {images.map((src, i) => (
            <RevealOnScroll key={src} delay={i * 80}>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square rounded-xl overflow-hidden bg-surface-container-low"
              >
                <Image
                  src={src}
                  alt="Nola & Co. az Instagramon"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 45vw, 23vw"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
                  </svg>
                </span>
              </a>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
