'use client';

import { useState } from 'react';
import Link from 'next/link';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

/** BLOKK 9: Hírlevél-feliratkozó sáv a lábléc fölött. */
export default function NewsletterBand() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
        setConsent(false);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-16 md:py-20 bg-[#C4A591]">
      <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
        <RevealOnScroll>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl text-[#FDFBF7] mb-4 tracking-[0.06em]"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Legyél a Nola család része!
          </h2>
        </RevealOnScroll>
        <RevealOnScroll>
          <p className="text-[#FDFBF7]/95 font-light leading-relaxed mb-8 max-w-2xl mx-auto">
            Iratkozz fel, hogy elsőként értesülj a limitált kollekciókról, és megajándékozunk egy{' '}
            <strong className="font-bold">INGYENES SZÁLLÍTÁS</strong> kuponnal az első
            rendelésedhez!
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          {status === 'success' ? (
            <p className="text-[#FDFBF7] text-lg font-medium">
              Sikeres feliratkozás! Hamarosan megérkezik a kuponod. 🤍
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="E-mail címed"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-5 py-3.5 rounded-full border border-[#FDFBF7]/40 bg-[#FDFBF7] text-sm text-carbon focus:outline-none focus:border-[#FDFBF7] transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !consent}
                  className="bg-[#FDFBF7] text-[#C4A591] px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-[0.1em] btn-anim whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? '...' : 'Feliratkozom'}
                </button>
              </div>
              <label className="flex items-start gap-2 text-xs text-[#FDFBF7]/90 leading-relaxed cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-none accent-[#FDFBF7] cursor-pointer"
                />
                <span>
                  Szeretnék e-mailben hírlevelet kapni a Nola &amp; Co-tól. A hozzájárulás bármikor
                  visszavonható a levelek alján található leiratkozási linken.{' '}
                  <Link href="/adatkezeles" className="underline underline-offset-2 hover:text-[#FDFBF7]">
                    Adatkezelés
                  </Link>
                </span>
              </label>
              {status === 'error' && (
                <p className="text-sm text-[#FDFBF7]">
                  Hiba történt, kérlek próbáld újra később.
                </p>
              )}
            </form>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}
