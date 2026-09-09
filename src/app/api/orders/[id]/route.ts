import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;

  const [order] = await sql`
    SELECT o.*, s.full_name AS assigned_to_name, c.full_name AS created_by_name
    FROM orders o
    LEFT JOIN staff s ON s.id = o.assigned_to
    LEFT JOIN staff c ON c.id = o.created_by
    WHERE o.id = ${id}
  `;
  if (!order) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const history = await sql`
    SELECT h.*, s.full_name AS handled_by_name, a.full_name AS approved_by_name
    FROM order_stage_history h
    LEFT JOIN staff s ON s.id = h.handled_by
    LEFT JOIN staff a ON a.id = h.approved_by
    WHERE h.order_id = ${id}
    ORDER BY h.started_at ASC
  `;

  const measurements = await sql`SELECT * FROM order_measurements WHERE order_id = ${id} ORDER BY created_at DESC LIMIT 1`;

  return NextResponse.json({ order, history, measurements: measurements[0] || null });
}
