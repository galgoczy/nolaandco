'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { trackMetaEvent } from '@/lib/metaPixel';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError('A jelszónak legalább 8 karakterből kell állnia.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError('A két jelszó nem egyezik.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Hiba történt a regisztráció során.');
        setLoading(false);
        return;
      }
      trackMetaEvent('CompleteRegistration', {
        content_name: 'Account Registration',
        status: 'completed',
      });
      setSent(true);
    } catch {
      setError('Hálózati hiba. Kérjük, próbáld újra.');
    } finally {
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
            Küldtünk egy megerősítő e-mailt a(z) <strong>{form.email}</strong> címre.
            A regisztráció befejezéséhez kattints a levélben található linkre.
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
            Regisztráció
          </h1>
          <p className="text-[#4A4A4A]/60 font-body text-sm mt-2">
            Hozz létre fiókot a Nola &amp; Co. oldalon
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#4A4A4A]/70 font-body mb-1">Teljes név</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A591]/30"
            />
          </div>
          <div>
            <label className="block text-xs text-[#4A4A4A]/70 font-body mb-1">E-mail cím</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A591]/30"
            />
          </div>
          <div>
            <label className="block text-xs text-[#4A4A4A]/70 font-body mb-1">Jelszó</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A591]/30"
            />
            <p className="text-[11px] text-[#4A4A4A]/50 mt-1">Minimum 8 karakter</p>
          </div>
          <div>
            <label className="block text-xs text-[#4A4A4A]/70 font-body mb-1">Jelszó megerősítése</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A591]/30"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-body text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C4A591] text-white py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
          <button
            onClick={() => signIn('google', { callbackUrl: '/fiok' })}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Regisztráció Google fiókkal
          </button>
          <p className="text-center text-xs text-[#4A4A4A]/60">
            Van már fiókod?{' '}
            <Link href="/bejelentkezes" className="underline hover:text-[#4A4A4A]">
              Jelentkezz be
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
