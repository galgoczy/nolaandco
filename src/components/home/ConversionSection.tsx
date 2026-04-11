'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function ConversionSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-24 md:py-32 bg-[#C4A591] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Lifestyle photo */}
          <RevealOnScroll>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/Konv.blokk.jpg"
                alt="Nola & Co. lifestyle"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </RevealOnScroll>

          {/* Right: Text + CTA + Newsletter */}
          <div className="space-y-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl montserrat-light-caps text-[#FDFBF7] leading-tight">
                KÉSZEN ÁLLSZ MEGŐRIZNI A LEGELSŐ PILLANATOKAT?
              </h2>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-[#FDFBF7]/90 font-light leading-relaxed">
                Minden Nola párna egyedi – akárcsak a te babád. Válaszd ki a neked tetsző formát,
                add meg a születési adatokat, és mi elkészítjük a legszebb emlékőrzőt.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/termekek"
                className="inline-block bg-[#FDFBF7] text-[#C4A591] px-10 py-4 rounded-full text-sm font-bold tracking-[0.15em] uppercase btn-anim shadow-xl"
              >
                Megnézem a termékeket
              </Link>
            </RevealOnScroll>

            {/* Newsletter */}
            <RevealOnScroll>
              <div className="pt-8 border-t border-[#FDFBF7]/30">
                <p className="text-[#FDFBF7]/95 font-light text-sm mb-4 leading-relaxed">
                  <strong className="font-bold block mb-1 text-[#FDFBF7]">Csatlakozz a Nola-közösséghez!</strong>
                  Iratkozz fel és legyél az elsők között, akik értesülnek az új kollekciókról,
                  limitált kiadású termékekről és VIP kedvezményekről.
                </p>
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="email"
                    placeholder="E-mail címed"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-full border border-[#FDFBF7]/40 bg-[#FDFBF7] text-sm text-carbon focus:outline-none focus:border-[#FDFBF7] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[#FDFBF7] text-[#C4A591] px-6 py-3 rounded-full text-sm font-medium btn-anim whitespace-nowrap"
                  >
                    {status === 'loading' ? '...' : 'Feliratkozom'}
                  </button>
                </form>
                {status === 'success' && (
                  <p className="text-sm text-[#FDFBF7] mt-2">Sikeres feliratkozás!</p>
                )}
                {status === 'error' && (
                  <p className="text-sm text-red-200 mt-2">Hiba történt, próbáld újra.</p>
                )}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
