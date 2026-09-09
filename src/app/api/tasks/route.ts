import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const tasks = session.fullAccess
    ? await sql`
        SELECT t.*, s.full_name AS assigned_to_name, o.order_no, o.client_name
        FROM tasks t
        LEFT JOIN staff s ON s.id = t.assigned_to
        LEFT JOIN orders o ON o.id = t.order_id
        ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC LIMIT 100
      `
    : await sql`
        SELECT t.*, s.full_name AS assigned_to_name, o.order_no, o.client_name
        FROM tasks t
        LEFT JOIN staff s ON s.id = t.assigned_to
        LEFT JOIN orders o ON o.id = t.order_id
        WHERE t.assigned_to = ${session.staffId}
        ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC LIMIT 100
      `;
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { title, description, order_id, assigned_to, due_date, priority } = await req.json();
  if (!title || !assigned_to) return NextResponse.json({ error: 'title and assigned_to required' }, { status: 400 });

  const [task] = await sql`
    INSERT INTO tasks (title, description, order_id, assigned_to, assigned_by, due_date, priority)
    VALUES (${title}, ${description || null}, ${order_id || null}, ${assigned_to}, ${session.staffId}, ${due_date || null}, ${priority || 'normal'})
    RETURNING *
  `;

  await sql`
    INSERT INTO notifications (staff_id, title, body, category, ref_task_id)
    VALUES (${assigned_to}, 'New task assigned', ${title}, 'task', ${task.id})
  `;

  return NextResponse.json(task, { status: 201 });
}
