'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ScrollVideoHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    // Wait for video metadata to load
    const onMetadata = () => {
      // Set initial frame
      video.currentTime = 0;
    };
    video.addEventListener('loadedmetadata', onMetadata);

    const handleScroll = () => {
      if (!video.duration) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      // scrollProgress: 0 when section top is at viewport top,
      // 1 when we've scrolled past the "sticky zone" (sectionHeight - viewportHeight)
      const stickyDistance = sectionHeight - viewportHeight;
      if (stickyDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / stickyDistance));

      // Map scroll progress to video time
      video.currentTime = progress * video.duration;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      video.removeEventListener('loadedmetadata', onMetadata);
    };
  }, []);

  return (
    // The section is tall enough: 100vh for the viewport + extra height for scrolling through the video.
    // 300vh means 200vh of scroll distance controls the video playback.
    <section ref={sectionRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video - 16:9 centered/covered */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/scrollytelling/hero.mp4" type="video/mp4" />
          <source src="/scrollytelling/hero.webm" type="video/webm" />
        </video>

        {/* CTA overlay */}
        <div className="absolute inset-0 flex items-start md:items-center justify-center md:justify-end pt-[20vh] md:pt-0 px-8 md:px-32 z-10">
          <Link
            href="/termekek"
            className="bg-[#D5E8F0] text-carbon rounded-full px-14 py-5 text-lg font-bold tracking-wide btn-anim shadow-xl"
          >
            Fedezd fel a kollekciókat!
          </Link>
        </div>
      </div>
    </section>
  );
}
