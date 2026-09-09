import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

const STAGES = ['order_created','sourcing','dyeing','dye_qc','cutting','stitching','finishing','qc','ready'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action, reason } = await req.json();
  // action: 'advance' | 'rework'

  const [order] = await sql`SELECT * FROM orders WHERE id = ${id}`;
  if (!order) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const curIdx = STAGES.indexOf(order.current_stage);

  if (action === 'rework') {
    await sql`
      UPDATE order_stage_history SET status='failed', rework_reason=${reason || null}
      WHERE order_id=${id} AND stage=${order.current_stage} AND status='in_progress'
    `;
    const prevStage = STAGES[Math.max(0, curIdx - 3)]; // send back to cutting-ish by default
    await sql`UPDATE orders SET current_stage=${prevStage} WHERE id=${id}`;
    await sql`
      INSERT INTO order_stage_history (order_id, stage, status, handled_by, is_rework, rework_reason)
      VALUES (${id}, ${prevStage}, 'rework', ${session.staffId}, true, ${reason || null})
    `;
    return NextResponse.json({ ok: true, newStage: prevStage, rework: true });
  }

  // mark current stage done
  await sql`
    UPDATE order_stage_history SET status='done', completed_at=now(), approved_by=${session.staffId}
    WHERE order_id=${id} AND stage=${order.current_stage} AND status IN ('in_progress','pending')
  `;

  const nextIdx = curIdx + 1;
  if (nextIdx >= STAGES.length) {
    await sql`UPDATE orders SET status='completed', current_stage=${STAGES[STAGES.length-1]} WHERE id=${id}`;
    return NextResponse.json({ ok: true, completed: true });
  }

  const nextStage = STAGES[nextIdx];
  await sql`UPDATE orders SET current_stage=${nextStage} WHERE id=${id}`;
  await sql`
    INSERT INTO order_stage_history (order_id, stage, status, handled_by)
    VALUES (${id}, ${nextStage}, 'in_progress', ${session.staffId})
  `;

  return NextResponse.json({ ok: true, newStage: nextStage });
}
