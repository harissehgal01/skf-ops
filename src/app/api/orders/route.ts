import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const orders = await sql`
    SELECT o.id, o.order_no, o.client_name, o.order_type, o.style_name, o.colour,
           o.delivery_date, o.current_stage, o.status, o.lead_time_warning,
           s.full_name AS assigned_to_name
    FROM orders o
    LEFT JOIN staff s ON s.id = o.assigned_to
    ORDER BY o.created_at DESC
    LIMIT 100
  `;
  return NextResponse.json(orders);
}

const STAGES = ['order_created','sourcing','dyeing','dye_qc','cutting','stitching','finishing','qc','ready'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    order_no, client_name, client_phone, order_type,
    style_name, colour, shirt_details, pant_details, duppatta_details,
    delivery_date,
  } = body;

  if (!order_no || !client_name || !delivery_date) {
    return NextResponse.json({ error: 'order_no, client_name, delivery_date required' }, { status: 400 });
  }

  const [order] = await sql`
    INSERT INTO orders (
      order_no, client_name, client_phone, order_type, style_name, colour,
      shirt_details, pant_details, duppatta_details, delivery_date,
      current_stage, created_by
    ) VALUES (
      ${order_no}, ${client_name}, ${client_phone || null}, ${order_type || 'regular'},
      ${style_name || null}, ${colour || null}, ${shirt_details || null},
      ${pant_details || null}, ${duppatta_details || null}, ${delivery_date},
      ${STAGES[0]}, ${session.staffId}
    ) RETURNING *
  `;

  await sql`
    INSERT INTO order_stage_history (order_id, stage, status, handled_by, completed_at)
    VALUES (${order.id}, 'order_created', 'done', ${session.staffId}, now())
  `;

  return NextResponse.json(order, { status: 201 });
}
