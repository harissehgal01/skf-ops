'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

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

type OrderData = {
  order: {
    id: number; order_no: string; client_name: string; client_phone: string | null;
    order_type: string; style_name: string | null; colour: string | null;
    shirt_details: string | null; pant_details: string | null; duppatta_details: string | null;
    delivery_date: string; current_stage: string; status: string; lead_time_warning: boolean;
    assigned_to_name: string | null; created_by_name: string | null;
  };
  history: Array<{
    id: number; stage: string; status: string; handled_by_name: string | null;
    approved_by_name: string | null; is_rework: boolean; rework_reason: string | null;
    started_at: string; completed_at: string | null;
  }>;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<OrderData | null>(null);
  const [busy, setBusy] = useState(false);
  const [reworkReason, setReworkReason] = useState('');
  const [showRework, setShowRework] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/orders/${id}`).then(r => r.json()).then(setData);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function advance() {
    setBusy(true);
    await fetch(`/api/orders/${id}/stage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'advance' }),
    });
    setBusy(false);
    load();
  }

  async function rework() {
    setBusy(true);
    await fetch(`/api/orders/${id}/stage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rework', reason: reworkReason }),
    });
    setBusy(false);
    setShowRework(false);
    setReworkReason('');
    load();
  }

  if (!data) return <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--color-cream-dark)' }} />;

  const { order, history } = data;

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>{order.client_name}</h1>
        <p className="text-sm" style={{ color: 'var(--color-charcoal-soft)' }}>#{order.order_no}</p>
      </div>

      <div className="rounded-2xl p-4 border space-y-2" style={{ background: 'white', borderColor: 'var(--color-cream-dark)' }}>
        <Row label="Style" value={order.style_name} />
        <Row label="Colour" value={order.colour} />
        <Row label="Shirt" value={order.shirt_details} />
        <Row label="Pant/Sharara" value={order.pant_details} />
        <Row label="Duppatta" value={order.duppatta_details} />
        <Row label="Delivery" value={new Date(order.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
        <Row label="Type" value={order.order_type} />
      </div>

      {order.lead_time_warning && (
        <div className="rounded-2xl p-3 border" style={{ background: '#FBEEE9', borderColor: 'var(--color-rose)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>⚑ Bridal order under 3-month lead time</p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium mb-2" style={{ color: 'var(--color-charcoal-soft)' }}>Pipeline</h2>
        <div className="rounded-2xl p-4 border space-y-3" style={{ background: 'white', borderColor: 'var(--color-cream-dark)' }}>
          {history.map(h => (
            <div key={h.id} className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{
                  background: h.status === 'done' ? 'var(--color-sage)' : h.status === 'failed' || h.is_rework ? 'var(--color-danger)' : 'var(--color-sky-deep)',
                }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>
                  {STAGE_LABELS[h.stage] || h.stage} {h.is_rework && <span style={{ color: 'var(--color-danger)' }}>(rework)</span>}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-charcoal-soft)' }}>
                  {h.handled_by_name || '—'} · {h.status}
                  {h.rework_reason && ` — ${h.rework_reason}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.status === 'active' && (
        <div className="space-y-2">
          <button
            onClick={advance}
            disabled={busy}
            className="w-full py-3.5 rounded-xl font-medium text-base disabled:opacity-60"
            style={{ background: 'var(--color-sky-deep)', color: 'white' }}
          >
            {busy ? 'Updating…' : `Mark "${STAGE_LABELS[order.current_stage]}" Done → Next Stage`}
          </button>
          {!showRework ? (
            <button
              onClick={() => setShowRework(true)}
              className="w-full py-3 rounded-xl font-medium text-sm border"
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            >
              Send Back for Rework
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={reworkReason}
                onChange={e => setReworkReason(e.target.value)}
                placeholder="Reason (e.g. sizing off, finishing issue)"
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: 'var(--color-cream-dark)' }}
                rows={2}
              />
              <button
                onClick={rework}
                disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-sm"
                style={{ background: 'var(--color-danger)', color: 'white' }}
              >
                Confirm Rework
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span style={{ color: 'var(--color-charcoal-soft)' }}>{label}</span>
      <span className="text-right" style={{ color: 'var(--color-charcoal)' }}>{value}</span>
    </div>
  );
}
