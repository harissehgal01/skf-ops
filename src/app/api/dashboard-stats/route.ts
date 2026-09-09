import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const [activeOrders] = await sql`SELECT COUNT(*)::int AS n FROM orders WHERE status='active'`;
  const [bridalWarnings] = await sql`SELECT COUNT(*)::int AS n FROM orders WHERE lead_time_warning = true AND status='active'`;
  const [openTasks] = await sql`
    SELECT COUNT(*)::int AS n FROM tasks
    WHERE status IN ('open','in_progress')
    ${session.fullAccess ? sql`` : sql`AND assigned_to = ${session.staffId}`}
  `;
  const [openEscalations] = await sql`SELECT COUNT(*)::int AS n FROM escalations WHERE status IN ('open','acknowledged')`;
  const [dueSoon] = await sql`
    SELECT COUNT(*)::int AS n FROM orders
    WHERE status='active' AND delivery_date <= CURRENT_DATE + INTERVAL '7 days'
  `;

  return NextResponse.json({
    activeOrders: activeOrders.n,
    bridalWarnings: bridalWarnings.n,
    openTasks: openTasks.n,
    openEscalations: openEscalations.n,
    dueSoon: dueSoon.n,
  });
}
