'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputStyle = {
  borderColor: 'var(--color-cream-dark)',
  background: 'white',
  color: 'var(--color-charcoal)',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-charcoal-soft)' }}>{label}</label>
      {children}
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    order_no: '', client_name: '', client_phone: '', order_type: 'regular',
    style_name: '', colour: '', shirt_details: '', pant_details: '', duppatta_details: '',
    delivery_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to create'); return; }
    const order = await res.json();
    router.push(`/dashboard/orders/${order.id}`);
  }

  return (
    <div className="space-y-4 pb-8">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>New Order</h1>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Order Number">
          <input required value={form.order_no} onChange={e => set('order_no', e.target.value)} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>
        <Field label="Client Name">
          <input required value={form.client_name} onChange={e => set('client_name', e.target.value)} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>
        <Field label="Client Phone">
          <input value={form.client_phone} onChange={e => set('client_phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>
        <Field label="Order Type">
          <select value={form.order_type} onChange={e => set('order_type', e.target.value)} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle}>
            <option value="regular">Regular</option>
            <option value="bridal">Bridal</option>
            <option value="sample">Sample</option>
          </select>
        </Field>
        <Field label="Style Name">
          <input value={form.style_name} onChange={e => set('style_name', e.target.value)} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>
        <Field label="Colour">
          <input value={form.colour} onChange={e => set('colour', e.target.value)} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>
        <Field label="Shirt Details">
          <textarea value={form.shirt_details} onChange={e => set('shirt_details', e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>
        <Field label="Pant / Sharara Details">
          <textarea value={form.pant_details} onChange={e => set('pant_details', e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>
        <Field label="Duppatta Details">
          <textarea value={form.duppatta_details} onChange={e => set('duppatta_details', e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>
        <Field label="Delivery Date">
          <input required type="date" value={form.delivery_date} onChange={e => set('delivery_date', e.target.value)} className="w-full px-4 py-3 rounded-xl border text-base" style={inputStyle} />
        </Field>

        {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-medium text-base disabled:opacity-60"
          style={{ background: 'var(--color-sky-deep)', color: 'white' }}
        >
          {loading ? 'Creating…' : 'Create Order'}
        </button>
      </form>
    </div>
  );
}
