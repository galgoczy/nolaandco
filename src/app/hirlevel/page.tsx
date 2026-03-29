'use client';

import { useState, FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function HirlevelPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Hiba történt a feliratkozás során.');
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Hiba történt a feliratkozás során.'
      );
    }
  }

  return (
    <section className="min-h-[80vh] bg-warm-beige flex items-center justify-center px-4 py-24">
      <div className="max-w-xl w-full text-center">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-6">
            Hírlevél
          </h1>

          <div className="w-12 h-[2px] bg-primary mx-auto mb-8" />

          <p className="text-carbon-light font-body text-lg leading-relaxed mb-12">
            Iratkozz fel hírlevelünkre és értesülj elsőként az újdonságokról,
            akciókról és különleges ajánlatokról.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          {status === 'success' ? (
            <div className="bg-surface-container-lowest rounded-lg p-8 ghost-border">
              <div className="text-4xl mb-4">&#10003;</div>
              <p className="text-carbon text-lg font-headline font-medium">
                Sikeresen feliratkoztál!
              </p>
              <p className="text-carbon-light mt-2 font-body">
                Köszönjük, hamarosan értesítünk az újdonságokról.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                name="email"
                placeholder="E-mail címed"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center"
              />

              {status === 'error' && (
                <p className="text-error text-sm">{errorMessage}</p>
              )}

              <Button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Feliratkozás...' : 'Feliratkozom'}
              </Button>
            </form>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}
