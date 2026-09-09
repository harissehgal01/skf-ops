'use client';
import { useEffect, useState } from 'react';

type StaffMember = {
  id: number; full_name: string; phone: string; is_active: boolean;
  role_name: string; role_code: string; reports_to_name: string | null;
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/staff').then(r => r.json()).then(d => { setStaff(d); setLoading(false); });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>Staff</h1>
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--color-cream-dark)' }} />)}</div>
      ) : (
        <div className="space-y-2">
          {staff.map(s => (
            <div key={s.id} className="rounded-2xl p-4 border flex items-center justify-between" style={{ background: 'white', borderColor: 'var(--color-cream-dark)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>{s.full_name}</p>
                <p className="text-xs" style={{ color: 'var(--color-charcoal-soft)' }}>
                  {s.role_name}{s.reports_to_name ? ` · reports to ${s.reports_to_name}` : ''}
                </p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: 'var(--color-sky)', color: 'var(--color-charcoal)' }}>
                {s.phone}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
