'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Hiba történt. Kérjük, próbáld újra.');
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Hálózati hiba. Kérjük, próbáld újra.');
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F7F3EE] p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
          <h1
            className="text-2xl text-[#4A4A4A] tracking-wide mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Ellenőrizd a postaládád
          </h1>
          <p className="text-sm text-[#4A4A4A]/70 font-body leading-relaxed mb-6">
            Ha a megadott e-mail címhez tartozik Nola &amp; Co. fiók, küldtünk egy
            jelszó-visszaállító linket. A link 1 óráig érvényes.
          </p>
          <p className="text-xs text-[#4A4A4A]/50 font-body">
            Nem találod? Ellenőrizd a Spam / Promóciók mappát.
          </p>
          <Link
            href="/bejelentkezes"
            className="inline-block mt-6 text-sm text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A]"
          >
            Vissza a bejelentkezéshez
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F7F3EE] p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-2xl text-[#4A4A4A] tracking-wide"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Elfelejtett jelszó
          </h1>
          <p className="text-[#4A4A4A]/60 font-body text-sm mt-2">
            Add meg az e-mail címed, és küldünk egy jelszó-visszaállító linket.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#4A4A4A]/70 font-body mb-1">E-mail cím</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A591]/30"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-body text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C4A591] text-white py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Küldés...' : 'Visszaállító link küldése'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-[#4A4A4A]/60">
          <Link href="/bejelentkezes" className="underline hover:text-[#4A4A4A]">
            Vissza a bejelentkezéshez
          </Link>
        </div>
      </div>
    </div>
  );
}
