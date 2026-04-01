'use client';

import { useState } from 'react';
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
    <section className="py-24 md:py-32 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Placeholder lifestyle photo */}
          <RevealOnScroll>
            <div className="aspect-[4/3] rounded-2xl bg-surface-container flex items-center justify-center">
              <span className="text-carbon-light/40 text-sm font-body">Lifestyle fotó helye</span>
            </div>
          </RevealOnScroll>

          {/* Right: Text + CTA + Newsletter */}
          <div className="space-y-8">
            <RevealOnScroll>
              <h2 className="text-3xl md:text-4xl montserrat-light-caps text-carbon leading-tight">
                KÉSZEN ÁLLSZ MEGŐRIZNI A LEGELSŐ PILLANATOKAT?
              </h2>
            </RevealOnScroll>
            <RevealOnScroll>
              <p className="text-carbon-light font-light leading-relaxed">
                Minden Nola párna egyedi – akárcsak a te babád. Válaszd ki a tökéletes formát,
                add meg a születési adatokat, és mi elkészítjük a legszebb emlékőrzőt.
              </p>
            </RevealOnScroll>
            <RevealOnScroll>
              <Link
                href="/termekek"
                className="inline-block bg-[#D5E8F0] text-carbon px-10 py-4 rounded-full text-sm font-bold tracking-wide btn-anim"
              >
                Megnézem a kollekciókat
              </Link>
            </RevealOnScroll>

            {/* Newsletter */}
            <RevealOnScroll>
              <div className="pt-8 border-t border-[#4A4A4A]/10">
                <p className="text-carbon-light font-light text-sm mb-4">
                  Nem döntöttél még? Iratkozz fel hírlevelünkre, és értesítünk az újdonságokról,
                  akciókról és limitált kiadásokról!
                </p>
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="email"
                    placeholder="E-mail címed"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-full border border-[#4A4A4A]/20 bg-white text-sm text-carbon focus:outline-none focus:border-[#C4A591] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[#D5E8F0] text-carbon px-6 py-3 rounded-full text-sm font-medium btn-anim whitespace-nowrap"
                  >
                    {status === 'loading' ? '...' : 'Feliratkozom'}
                  </button>
                </form>
                {status === 'success' && (
                  <p className="text-sm text-green-600 mt-2">Sikeres feliratkozás!</p>
                )}
                {status === 'error' && (
                  <p className="text-sm text-red-500 mt-2">Hiba történt, próbáld újra.</p>
                )}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
