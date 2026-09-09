'use client';
import { useEffect, useState, useCallback } from 'react';

type Esc = {
  id: number; title: string; description: string | null; severity: string; status: string;
  raised_by_name: string | null; routed_to_name: string | null; order_no: string | null;
  auto_escalate_at: string; created_at: string;
};

const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  open: { bg: '#FBEEE9', fg: 'var(--color-danger)' },
  acknowledged: { bg: '#FBF3E5', fg: 'var(--color-warn)' },
  escalated: { bg: '#FBEEE9', fg: 'var(--color-danger)' },
  resolved: { bg: '#EEF3EC', fg: 'var(--color-sage)' },
};

export default function EscalationsPage() {
  const [items, setItems] = useState<Esc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(() => {
    fetch('/api/escalations').then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resolve(id: number) {
    await fetch(`/api/escalations/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/escalations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    setTitle(''); setDescription(''); setShowForm(false);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>Alerts</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-xs px-4 py-2 rounded-full font-medium"
          style={{ background: 'var(--color-danger)', color: 'white' }}
        >
          + Raise Issue
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="rounded-2xl p-4 border space-y-3" style={{ background: 'white', borderColor: 'var(--color-cream-dark)' }}>
          <input
            required value={title} onChange={e => setTitle(e.target.value)}
            placeholder="What's the issue?"
            className="w-full px-4 py-3 rounded-xl border text-sm" style={{ borderColor: 'var(--color-cream-dark)' }}
          />
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Details (optional)" rows={2}
            className="w-full px-4 py-3 rounded-xl border text-sm" style={{ borderColor: 'var(--color-cream-dark)' }}
          />
          <button type="submit" className="w-full py-3 rounded-xl font-medium text-sm" style={{ background: 'var(--color-danger)', color: 'white' }}>
            Submit — routes to your manager
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--color-cream-dark)' }} />)}</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--color-charcoal-soft)' }}>No alerts.</p>
      ) : (
        <div className="space-y-2">
          {items.map(e => {
            const c = STATUS_COLOR[e.status] || STATUS_COLOR.open;
            return (
              <div key={e.id} className="rounded-2xl p-4 border" style={{ background: 'white', borderColor: 'var(--color-cream-dark)' }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1" style={{ color: 'var(--color-charcoal)' }}>{e.title}</p>
                  <span className="text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0" style={{ background: c.bg, color: c.fg }}>
                    {e.status}
                  </span>
                </div>
                {e.description && <p className="text-xs mt-1" style={{ color: 'var(--color-charcoal-soft)' }}>{e.description}</p>}
                <p className="text-[11px] mt-2" style={{ color: 'var(--color-charcoal-soft)' }}>
                  Raised by {e.raised_by_name} {e.routed_to_name && `· routed to ${e.routed_to_name}`}
                </p>
                {e.status !== 'resolved' && (
                  <button
                    onClick={() => resolve(e.id)}
                    className="text-xs mt-2 px-3 py-1.5 rounded-full font-medium"
                    style={{ background: 'var(--color-sage)', color: 'white' }}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
