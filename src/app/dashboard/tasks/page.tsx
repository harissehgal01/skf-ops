'use client';
import { useEffect, useState, useCallback } from 'react';

type Task = {
  id: number; title: string; description: string | null; due_date: string | null;
  priority: string; status: string; assigned_to_name: string | null;
  order_no: string | null; client_name: string | null;
};

const PRIORITY_COLOR: Record<string, string> = {
  low: 'var(--color-charcoal-soft)',
  normal: 'var(--color-sky-deep)',
  high: 'var(--color-warn)',
  urgent: 'var(--color-danger)',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch('/api/tasks').then(r => r.json()).then(d => { setTasks(d); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleDone(t: Task) {
    const newStatus = t.status === 'done' ? 'open' : 'done';
    await fetch(`/api/tasks/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>Tasks</h1>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--color-cream-dark)' }} />)}</div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--color-charcoal-soft)' }}>No tasks assigned.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: 'white', borderColor: 'var(--color-cream-dark)' }}>
              <button
                onClick={() => toggleDone(t)}
                className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                style={{ borderColor: t.status === 'done' ? 'var(--color-sage)' : 'var(--color-cream-dark)', background: t.status === 'done' ? 'var(--color-sage)' : 'transparent' }}
              >
                {t.status === 'done' && <span className="text-white text-xs">✓</span>}
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-charcoal)', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>
                  {t.title}
                </p>
                {t.client_name && (
                  <p className="text-xs" style={{ color: 'var(--color-charcoal-soft)' }}>{t.client_name} · #{t.order_no}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--color-cream-dark)', color: PRIORITY_COLOR[t.priority] }}>
                    {t.priority}
                  </span>
                  {t.due_date && (
                    <span className="text-[11px]" style={{ color: 'var(--color-charcoal-soft)' }}>
                      Due {new Date(t.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
