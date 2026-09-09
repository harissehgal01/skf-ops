import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const staff = await sql`
    SELECT s.id, s.full_name, s.phone, s.is_active, r.name AS role_name, r.code AS role_code,
           m.full_name AS reports_to_name
    FROM staff s
    JOIN roles r ON r.id = s.role_id
    LEFT JOIN staff m ON m.id = s.reports_to
    ORDER BY r.full_access DESC, s.full_name ASC
  `;
  return NextResponse.json(staff);
}
