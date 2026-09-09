'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Order = {
  id: number;
  order_no: string;
  client_name: string;
  order_type: string;
  style_name: string | null;
  colour: string | null;
  delivery_date: string;
  current_stage: string;
  status: string;
  lead_time_warning: boolean;
  assigned_to_name: string | null;
};

const STAGE_LABELS: Record<string, string> = {
  order_created: 'Order Created',
  sourcing: 'Sourcing',
  dyeing: 'Dyeing',
  dye_qc: 'Dye QC',
  cutting: 'Cutting',
  stitching: 'Stitching',
  finishing: 'Finishing',
  qc: 'QC',
  ready: 'Ready',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => { setOrders(d); setLoading(false); });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>Orders</h1>
        <Link
          href="/dashboard/orders/new"
          className="text-xs px-4 py-2 rounded-full font-medium"
          style={{ background: 'var(--color-sky-deep)', color: 'white' }}
        >
          + New Order
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--color-cream-dark)' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--color-charcoal-soft)' }}>No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <Link
              key={o.id}
              href={`/dashboard/orders/${o.id}`}
              className="block rounded-2xl p-4 border"
              style={{ background: 'white', borderColor: o.lead_time_warning ? 'var(--color-rose)' : 'var(--color-cream-dark)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-charcoal)' }}>{o.client_name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-charcoal-soft)' }}>
                    #{o.order_no} · {o.style_name || '—'} {o.colour ? `· ${o.colour}` : ''}
                  </p>
                </div>
                <span
                  className="text-[10px] px-2 py-1 rounded-full font-medium"
                  style={{
                    background: o.order_type === 'bridal' ? '#FBEEE9' : 'var(--color-cream-dark)',
                    color: o.order_type === 'bridal' ? 'var(--color-danger)' : 'var(--color-charcoal-soft)',
                  }}
                >
                  {o.order_type}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'var(--color-sky)', color: 'var(--color-charcoal)' }}
                >
                  {STAGE_LABELS[o.current_stage] || o.current_stage}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-charcoal-soft)' }}>
                  Due {new Date(o.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              {o.lead_time_warning && (
                <p className="text-[11px] mt-2 font-medium" style={{ color: 'var(--color-danger)' }}>⚑ Bridal lead-time warning</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
