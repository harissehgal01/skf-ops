'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS: Record<string, string> = {
  dashboard: '⌂',
  orders: '🧵',
  tasks: '✓',
  escalations: '⚑',
  staff: '👥',
};

export default function BottomNav({ roleCode, fullAccess }: { roleCode: string; fullAccess: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: '/dashboard', label: 'Home', key: 'dashboard' },
    { href: '/dashboard/orders', label: 'Orders', key: 'orders' },
    { href: '/dashboard/tasks', label: 'Tasks', key: 'tasks' },
    { href: '/dashboard/escalations', label: 'Alerts', key: 'escalations' },
    ...(fullAccess || roleCode === 'production_manager'
      ? [{ href: '/dashboard/staff', label: 'Staff', key: 'staff' }]
      : []),
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t flex justify-around py-2 z-10"
      style={{ background: 'white', borderColor: 'var(--color-cream-dark)' }}
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.key}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg"
            style={{ color: active ? 'var(--color-sky-deep)' : 'var(--color-charcoal-soft)' }}
          >
            <span className="text-lg">{ICONS[item.key]}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
