'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Start offset in seconds — skip the first 1.5s of the video
const VIDEO_START_OFFSET = 1.5;

export default function ScrollVideoHeroV3() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const onMetadata = () => {
      video.currentTime = VIDEO_START_OFFSET;
    };
    video.addEventListener('loadedmetadata', onMetadata);

    const handleScroll = () => {
      if (!video.duration) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      const stickyDistance = sectionHeight - viewportHeight;
      if (stickyDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / stickyDistance));

      // Map scroll progress to the usable portion of the video (after offset)
      const usableDuration = video.duration - VIDEO_START_OFFSET;
      video.currentTime = VIDEO_START_OFFSET + progress * usableDuration;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      video.removeEventListener('loadedmetadata', onMetadata);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/scrollytelling/hero3.mp4" type="video/mp4" />
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
