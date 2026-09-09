import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // auto-escalate any overdue open items to the owner (full_access staff) before returning
  await sql`
    UPDATE escalations
    SET status = 'escalated', escalated_to = (SELECT id FROM staff WHERE phone='03472399250' LIMIT 1)
    WHERE status IN ('open','acknowledged') AND auto_escalate_at < now() AND escalated_to IS NULL
  `;

  const rows = session.fullAccess
    ? await sql`
        SELECT e.*, r.full_name AS raised_by_name, t.full_name AS routed_to_name, o.order_no
        FROM escalations e
        LEFT JOIN staff r ON r.id = e.raised_by
        LEFT JOIN staff t ON t.id = e.routed_to
        LEFT JOIN orders o ON o.id = e.order_id
        ORDER BY e.created_at DESC LIMIT 100
      `
    : await sql`
        SELECT e.*, r.full_name AS raised_by_name, t.full_name AS routed_to_name, o.order_no
        FROM escalations e
        LEFT JOIN staff r ON r.id = e.raised_by
        LEFT JOIN staff t ON t.id = e.routed_to
        LEFT JOIN orders o ON o.id = e.order_id
        WHERE e.raised_by = ${session.staffId} OR e.routed_to = ${session.staffId}
        ORDER BY e.created_at DESC LIMIT 100
      `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { title, description, order_id, severity } = await req.json();
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const [raiser] = await sql`SELECT reports_to FROM staff WHERE id = ${session.staffId}`;
  const routedTo = raiser?.reports_to || null;

  const [esc] = await sql`
    INSERT INTO escalations (title, description, order_id, raised_by, routed_to, severity)
    VALUES (${title}, ${description || null}, ${order_id || null}, ${session.staffId}, ${routedTo}, ${severity || 'normal'})
    RETURNING *
  `;

  if (routedTo) {
    await sql`
      INSERT INTO notifications (staff_id, title, body, category, ref_esc_id)
      VALUES (${routedTo}, 'New escalation raised', ${title}, 'escalation', ${esc.id})
    `;
  }

  return NextResponse.json(esc, { status: 201 });
}
