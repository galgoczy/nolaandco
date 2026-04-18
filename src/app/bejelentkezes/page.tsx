'use client';

import { Suspense, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/fiok';
  const urlError = searchParams.get('error');
  const verified = searchParams.get('verified');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (!res) {
        setError('Bejelentkezési hiba.');
        setLoading(false);
        return;
      }
      if (res.error) {
        if (res.error === 'EMAIL_NOT_VERIFIED') {
          setError('Az e-mail címed még nincs megerősítve. Ellenőrizd a postaládád.');
        } else {
          setError('Hibás e-mail cím vagy jelszó.');
        }
        setLoading(false);
        return;
      }
      router.push(res.url || callbackUrl);
    } catch {
      setError('Hálózati hiba. Kérjük, próbáld újra.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F7F3EE] p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-2xl text-[#4A4A4A] tracking-wide"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
          >
            Bejelentkezés
          </h1>
          <p className="text-[#4A4A4A]/60 font-body text-sm mt-2">
            Lépj be a Nola &amp; Co. fiókodba
          </p>
        </div>

        {verified && (
          <p className="text-sm text-green-600 font-body text-center bg-green-50 rounded-lg p-3 mb-4">
            Sikeres megerősítés! Most már bejelentkezhetsz.
          </p>
        )}

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
          <div>
            <label className="block text-xs text-[#4A4A4A]/70 font-body mb-1">Jelszó</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A591]/30"
            />
          </div>

          {(error || urlError) && (
            <p className="text-red-500 text-sm font-body text-center">
              {error || 'Sikertelen bejelentkezés. Próbáld újra.'}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C4A591] text-white py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] text-[#4A4A4A]/50 uppercase tracking-wide">vagy</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Bejelentkezés Google fiókkal
        </button>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-[#4A4A4A]/60 space-y-3">
          <p>
            Még nincs fiókod?{' '}
            <Link href="/regisztracio" className="underline hover:text-[#4A4A4A]">
              Regisztrálj
            </Link>
          </p>
          <p>
            Admin vagy?{' '}
            <Link href="/admin/bejelentkezes" className="underline hover:text-[#4A4A4A]">
              Admin bejelentkezés
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
