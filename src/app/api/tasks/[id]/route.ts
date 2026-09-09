import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();

  const completed_at = status === 'done' ? new Date().toISOString() : null;
  const [task] = await sql`
    UPDATE tasks SET status = ${status}, completed_at = ${completed_at}
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(task);
}
