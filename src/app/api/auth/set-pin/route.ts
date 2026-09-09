import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { phone, pin } = await req.json();
  if (!phone || !pin || pin.length < 4) {
    return NextResponse.json({ error: 'Phone and a 4+ digit PIN required' }, { status: 400 });
  }

  const rows = await sql`
    SELECT s.id, s.full_name, s.pin_hash, s.is_active,
           r.code AS role_code, r.name AS role_name, r.full_access, r.permissions
    FROM staff s JOIN roles r ON r.id = s.role_id
    WHERE s.phone = ${phone}
    LIMIT 1
  `;
  const staff = rows[0];
  if (!staff || !staff.is_active) {
    return NextResponse.json({ error: 'Account not found. Ask admin to add you first.' }, { status: 404 });
  }
  if (staff.pin_hash) {
    return NextResponse.json({ error: 'PIN already set. Use login instead.' }, { status: 409 });
  }

  const hash = await bcrypt.hash(pin, 10);
  await sql`UPDATE staff SET pin_hash = ${hash} WHERE id = ${staff.id}`;

  await createSession({
    staffId: staff.id,
    fullName: staff.full_name,
    roleCode: staff.role_code,
    roleName: staff.role_name,
    fullAccess: staff.full_access,
    permissions: staff.permissions,
  });

  return NextResponse.json({ ok: true, roleCode: staff.role_code });
}
