'use client';
import { useEffect, useRef, ReactNode } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  bgClass?: string;
  className?: string;
  speed?: number;
}

export default function ParallaxSection({
  children,
  bgClass = '',
  className = '',
  speed = 0.3,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    let rafId: number;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const scrollProgress = rect.top / window.innerHeight;
        const offset = scrollProgress * speed * 100;
        bg.style.transform = `translateY(${offset}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <section ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={bgRef}
        className={`absolute inset-0 -top-20 -bottom-20 ${bgClass}`}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
