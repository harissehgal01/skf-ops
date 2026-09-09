'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Stats = {
  activeOrders: number;
  bridalWarnings: number;
  openTasks: number;
  openEscalations: number;
  dueSoon: number;
};

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl p-4 flex flex-col gap-1 border transition active:scale-[0.98]"
      style={{ background: 'white', borderColor: 'var(--color-cream-dark)' }}
    >
      <span className="text-2xl font-semibold" style={{ color: accent }}>{value}</span>
      <span className="text-xs" style={{ color: 'var(--color-charcoal-soft)' }}>{label}</span>
    </Link>
  );
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard-stats').then(r => r.json()).then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>Overview</h1>
        <p className="text-sm" style={{ color: 'var(--color-charcoal-soft)' }}>Today at SKF</p>
      </div>

      {!stats ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--color-cream-dark)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Active Orders" value={stats.activeOrders} href="/dashboard/orders" accent="var(--color-sky-deep)" />
          <StatCard label="Due Within 7 Days" value={stats.dueSoon} href="/dashboard/orders" accent="var(--color-warn)" />
          <StatCard label="Open Tasks" value={stats.openTasks} href="/dashboard/tasks" accent="var(--color-sage)" />
          <StatCard label="Open Alerts" value={stats.openEscalations} href="/dashboard/escalations" accent="var(--color-danger)" />
        </div>
      )}

      {stats && stats.bridalWarnings > 0 && (
        <div
          className="rounded-2xl p-4 border"
          style={{ background: '#FBEEE9', borderColor: 'var(--color-rose)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
            ⚑ {stats.bridalWarnings} bridal order{stats.bridalWarnings > 1 ? 's' : ''} under the 3-month lead time
          </p>
          <Link href="/dashboard/orders" className="text-xs underline" style={{ color: 'var(--color-danger)' }}>
            Review orders →
          </Link>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium" style={{ color: 'var(--color-charcoal-soft)' }}>Quick links</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/orders" className="rounded-2xl p-4 text-center border" style={{ background: 'white', borderColor: 'var(--color-cream-dark)', color: 'var(--color-charcoal)' }}>
            🧵 Orders
          </Link>
          <Link href="/dashboard/tasks" className="rounded-2xl p-4 text-center border" style={{ background: 'white', borderColor: 'var(--color-cream-dark)', color: 'var(--color-charcoal)' }}>
            ✓ My Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}
