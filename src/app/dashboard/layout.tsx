import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-cream)' }}>
      <TopBar session={session} />
      <main className="flex-1 pb-20 px-4 pt-4 max-w-2xl w-full mx-auto">{children}</main>
      <BottomNav roleCode={session.roleCode} fullAccess={session.fullAccess} />
    </div>
  );
}
