'use client';
import { useRouter } from 'next/navigation';
import type { Session } from '@/lib/auth';

export default function TopBar({ session }: { session: Session }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <header
      className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 border-b"
      style={{ background: 'var(--color-cream)', borderColor: 'var(--color-cream-dark)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'var(--color-sky)' }}
        >
          <span className="font-serif-brand text-sm italic" style={{ color: 'var(--color-charcoal)' }}>SKF</span>
        </div>
        <div>
          <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-charcoal)' }}>{session.fullName}</p>
          <p className="text-xs leading-tight" style={{ color: 'var(--color-charcoal-soft)' }}>{session.roleName}</p>
        </div>
      </div>
      <button onClick={logout} className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--color-cream-dark)', color: 'var(--color-charcoal-soft)' }}>
        Logout
      </button>
    </header>
  );
}
