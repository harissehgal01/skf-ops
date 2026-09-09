'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [needsPin, setNeedsPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (res.status === 412) {
        setNeedsPin(true);
        setError('');
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not set PIN');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--color-cream)' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'var(--color-sky)' }}
          >
            <span className="font-serif-brand text-3xl italic" style={{ color: 'var(--color-charcoal)' }}>SKF</span>
          </div>
          <p className="text-sm tracking-wide" style={{ color: 'var(--color-charcoal-soft)' }}>Internal Operations</p>
        </div>

        {!needsPin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-charcoal-soft)' }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-cream-dark)', background: 'white', color: 'var(--color-charcoal)' }}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-charcoal-soft)' }}>PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2 tracking-widest"
                style={{ borderColor: 'var(--color-cream-dark)', background: 'white', color: 'var(--color-charcoal)' }}
                required
              />
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-medium text-base transition active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--color-sky-deep)', color: 'white' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetPin} className="space-y-4">
            <p className="text-sm text-center mb-2" style={{ color: 'var(--color-charcoal-soft)' }}>
              First time here — set up a PIN for your account.
            </p>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-charcoal-soft)' }}>New PIN (4+ digits)</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2 tracking-widest"
                style={{ borderColor: 'var(--color-cream-dark)', background: 'white', color: 'var(--color-charcoal)' }}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-charcoal-soft)' }}>Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2 tracking-widest"
                style={{ borderColor: 'var(--color-cream-dark)', background: 'white', color: 'var(--color-charcoal)' }}
                required
              />
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-medium text-base transition active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--color-sky-deep)', color: 'white' }}
            >
              {loading ? 'Setting up…' : 'Set PIN & Continue'}
            </button>
            <button
              type="button"
              onClick={() => { setNeedsPin(false); setError(''); }}
              className="w-full text-sm py-2"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
