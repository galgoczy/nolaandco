'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Sikertelen bejelentkezés');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Hálózati hiba történt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            Nola &amp; Co Admin
          </h1>
          <p className="text-on-surface/60 font-body text-sm mt-1">
            Bejelentkezés az admin felületre
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail cím"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Jelszó"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-red-500 text-sm font-body">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </Button>
        </form>
      </div>
    </div>
  );
}
