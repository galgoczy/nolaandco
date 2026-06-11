'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Status = 'loading' | 'success' | 'already' | 'error';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Hiányzó megerősítő token.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus('error');
          setError(data.error || 'Érvénytelen vagy lejárt megerősítő link.');
          return;
        }
        setStatus(data.alreadyVerified ? 'already' : 'success');
      } catch {
        if (!cancelled) {
          setStatus('error');
          setError('Hálózati hiba. Kérjük, próbáld újra.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const heading =
    status === 'loading'
      ? 'Megerősítés folyamatban...'
      : status === 'success'
        ? 'Sikeres megerősítés!'
        : status === 'already'
          ? 'Ez az e-mail már megerősítésre került'
          : 'Nem sikerült a megerősítés';

  const body =
    status === 'loading'
      ? 'Egy pillanat, ellenőrizzük a linket.'
      : status === 'success'
        ? 'Köszönjük, az e-mail címed megerősítetted. Mostantól bejelentkezhetsz a fiókodba.'
        : status === 'already'
          ? 'A fiókod már aktív. Jelentkezz be a folytatáshoz.'
          : error;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F7F3EE] p-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
        <h1
          className="text-2xl text-[#4A4A4A] tracking-wide mb-4"
          style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
        >
          {heading}
        </h1>
        <p className="text-sm text-[#4A4A4A]/70 font-body leading-relaxed mb-6">
          {body}
        </p>
        {(status === 'success' || status === 'already') && (
          <Link
            href="/bejelentkezes"
            className="inline-block bg-[#C4A591] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Bejelentkezés
          </Link>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/bejelentkezes"
              className="inline-block bg-[#C4A591] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Bejelentkezés
            </Link>
            <p className="text-xs text-[#4A4A4A]/60 font-body">
              A linkek 24 óráig érvényesek. Bejelentkezési kísérletnél új megerősítő levelet kérhetsz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
