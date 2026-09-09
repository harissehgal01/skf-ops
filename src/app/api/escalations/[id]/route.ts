import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const { status, resolution } = await req.json();

  const resolved_at = status === 'resolved' ? new Date().toISOString() : null;
  const [esc] = await sql`
    UPDATE escalations SET status = ${status}, resolution = ${resolution || null}, resolved_at = ${resolved_at}
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(esc);
}
