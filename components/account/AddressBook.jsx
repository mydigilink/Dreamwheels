'use client';
import { useState } from 'react';
import { STATES } from '@/lib/site';

const EMPTY = { label: 'Home', name: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: false };
const MAX = 10;

async function post(body) {
  const res = await fetch('/api/account/addresses/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data.addresses;
}

export default function AddressBook({ initial = [], defaults = {} }) {
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState(null); // null | address being edited ({} = new)
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function act(tag, body) {
    setBusy(tag);
    setError('');
    try {
      setList(await post(body));
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy('');
    }
  }

  async function save(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const ok = await act('save', { action: 'save', address: { ...f, id: editing.id, isDefault: f.isDefault === 'on' } });
    if (ok) setEditing(null);
  }

  if (editing) {
    const a = { ...EMPTY, name: defaults.name || '', phone: defaults.phone || '', ...editing };
    return (
      <form className="form" onSubmit={save}>
        <h3>{editing.id ? 'Edit address' : 'Add a new address'}</h3>
        <div className="row2">
          <div className="field"><label htmlFor="a-label">Label</label><input id="a-label" className="input" name="label" defaultValue={a.label} placeholder="Home, Office…" /></div>
          <div className="field"><label htmlFor="a-name">Full name <span className="req">*</span></label><input id="a-name" className="input" name="name" defaultValue={a.name} required autoComplete="name" /></div>
        </div>
        <div className="field"><label htmlFor="a-phone">Phone <span className="req">*</span></label><input id="a-phone" className="input" name="phone" type="tel" defaultValue={a.phone} required autoComplete="tel" /></div>
        <div className="field"><label htmlFor="a-addr">Address <span className="req">*</span></label><textarea id="a-addr" name="address" defaultValue={a.address} required autoComplete="street-address" style={{ minHeight: 80 }} /></div>
        <div className="row2">
          <div className="field"><label htmlFor="a-city">City <span className="req">*</span></label><input id="a-city" className="input" name="city" defaultValue={a.city} required autoComplete="address-level2" /></div>
          <div className="field"><label htmlFor="a-pin">Pincode <span className="req">*</span></label><input id="a-pin" className="input" name="pincode" defaultValue={a.pincode} inputMode="numeric" maxLength={6} required autoComplete="postal-code" /></div>
        </div>
        <div className="field">
          <label htmlFor="a-state">State <span className="req">*</span></label>
          <select id="a-state" name="state" defaultValue={a.state} required>
            <option value="" disabled>Select state</option>
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <label className="check"><input type="checkbox" name="isDefault" defaultChecked={a.isDefault || list.length === 0} /> Use as my default delivery address</label>
        {error && <div className="notice error" role="alert">{error}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn dark" disabled={Boolean(busy)}>{busy ? 'Saving…' : 'Save address'}</button>
          <button type="button" className="btn" onClick={() => { setEditing(null); setError(''); }}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="address-book">
      {error && <div className="notice error" role="alert" style={{ marginBottom: 12 }}>{error}</div>}
      <div className="address-grid">
        {list.map((a) => (
          <div key={a.id} className={`address-card${a.isDefault ? ' is-default' : ''}`}>
            <div className="address-top">
              <b>{a.label}</b>
              {a.isDefault && <span className="badge ok">Default</span>}
            </div>
            <p>
              {a.name}<br />
              {a.address}<br />
              {a.city}, {a.state} {a.pincode}<br />
              <span className="muted">{a.phone}</span>
            </p>
            <div className="address-actions">
              <button type="button" className="link-btn" onClick={() => setEditing(a)}>Edit</button>
              {!a.isDefault && <button type="button" className="link-btn" disabled={Boolean(busy)} onClick={() => act(`d${a.id}`, { action: 'default', id: a.id })}>Set as default</button>}
              <button
                type="button"
                className="link-btn danger"
                disabled={Boolean(busy)}
                onClick={() => window.confirm(`Remove the “${a.label}” address?`) && act(`x${a.id}`, { action: 'delete', id: a.id })}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {list.length < MAX && (
          <button type="button" className="address-card add" onClick={() => setEditing({})}>
            <span>+</span>
            Add a new address
          </button>
        )}
      </div>
    </div>
  );
}
