'use client';

import { Suspense, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetContent />
    </Suspense>
  );
}

function ResetContent() {
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Hiányzó visszaállító token.');
      return;
    }
    if (password.length < 8) {
      setError('A jelszónak legalább 8 karakterből kell állnia.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('A két jelszó nem egyezik.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Hiba történt. Kérjük, próbáld újra.');
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Hálózati hiba. Kérjük, próbáld újra.');
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F7F3EE] p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
          <h1
            className="text-2xl text-[#4A4A4A] tracking-wide mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Sikeres jelszómódosítás
          </h1>
          <p className="text-sm text-[#4A4A4A]/70 font-body leading-relaxed mb-6">
            Az új jelszavaddal bejelentkezhetsz a fiókodba.
          </p>
          <Link
            href="/bejelentkezes"
            className="inline-block bg-[#C4A591] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Bejelentkezés
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
            Új jelszó megadása
          </h1>
          <p className="text-[#4A4A4A]/60 font-body text-sm mt-2">
            Válassz egy új jelszót a fiókodhoz.
          </p>
        </div>

        {!token && (
          <p className="text-sm text-red-500 font-body text-center bg-red-50 rounded-lg p-3 mb-4">
            Hiányzó vagy érvénytelen visszaállító link.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#4A4A4A]/70 font-body mb-1">Új jelszó</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A591]/30"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-body text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-[#C4A591] text-white py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Mentés...' : 'Új jelszó mentése'}
          </button>
        </form>
      </div>
    </div>
  );
}
