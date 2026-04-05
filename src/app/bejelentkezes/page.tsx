'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/fiok';
  const error = searchParams.get('error');

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

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Bejelentkezés Google fiókkal
        </button>

        {error && (
          <p className="text-red-500 text-sm font-body mt-4 text-center">
            Sikertelen bejelentkezés. Próbáld újra.
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-[#4A4A4A]/60">
          <p>
            E-mailes regisztráció hamarosan érkezik.
          </p>
          <p className="mt-3">
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
