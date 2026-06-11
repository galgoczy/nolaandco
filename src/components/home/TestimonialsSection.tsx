import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const images = [
  '/testimonials/testimonial-1.jpg',
  '/testimonials/testimonial-2.jpg',
  '/testimonials/testimonial-3.jpg',
  '/testimonials/testimonial-4.jpg',
  '/testimonials/testimonial-5.jpg',
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <div className="overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar">
            <div className="flex gap-4 md:gap-6 px-8 pb-4">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="snap-start flex-shrink-0 w-[78%] md:w-[30%] relative aspect-square rounded-2xl overflow-hidden bg-surface-container shadow-sm"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 78vw, 30vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
