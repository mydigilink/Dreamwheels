'use client';
import { useState } from 'react';
import ImagePicker from './ImagePicker';
import WhatsAppButton from '../WhatsAppButton';
import { BikeIcon, CarIcon, ScooterIcon } from '../Icons';
import { brandsForType } from '@/lib/brands';
import { restorationMessage } from '@/lib/whatsapp';
import { MODULES } from '@/lib/site';

const NEEDS = ['Full frame-off restoration', 'Engine rebuild', 'Paint & chrome', 'Electrical / wiring', 'Upholstery & trims', 'Customisation', 'Not sure — need advice'];

export default function RestorationForm({ whatsapp, pageUrl, maxImages = 6, maxMb = 8, brands = [] }) {
  const [type, setType] = useState('Bike');
  const [needs, setNeeds] = useState([]);
  const [files, setFiles] = useState([]);
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('vehicleType', type);
    const notes = String(fd.get('requirementsText') || '');
    fd.set('requirements', [needs.join(', '), notes].filter(Boolean).join(' — '));
    fd.delete('requirementsText');
    files.forEach((f) => fd.append('images', f));

    for (const k of ['brand', 'model', 'year', 'condition', 'name']) if (!fd.get(k)) return setError('Please fill in all required fields.');
    if (!fd.get('requirements')) return setError('Tell us what work you need.');
    if (!/^[+\d][\d\s-]{7,}$/.test(String(fd.get('phone') || ''))) return setError('Please enter a valid phone number.');
    if (!files.length) return setError('Please add at least one photo.');

    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/restoration/', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setState('done');
    } catch (er) {
      setError(er.message);
      setState('idle');
    }
  }

  if (state === 'done')
    return (
      <div className="success-box">
        <div className="tick">✓</div>
        <h3>Request received</h3>
        <p className="muted">Our workshop team will review your photos and contact you to discuss the restoration. Requests are subject to inspection and approval.</p>
      </div>
    );

  return (
    <form className="form" onSubmit={submit} noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      <h3>Request a restoration</h3>
      <div className="field">
        <span className="label">Vehicle type <span className="req">*</span></span>
        <div className="seg" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[['Bike', BikeIcon], ['Scooter', ScooterIcon], ['Car', CarIcon]].map(([t, Icon]) => (
            <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)}><span><Icon /></span>{t}</button>
          ))}
        </div>
      </div>
      <div className="row2">
        <div className="field"><label htmlFor="r-brand">Brand <span className="req">*</span></label><input id="r-brand" className="input" name="brand" placeholder="e.g. Royal Enfield" list="r-brand-list" autoComplete="off" /><datalist id="r-brand-list">{brandsForType(brands, type).map((b) => <option key={b.name} value={b.name} />)}</datalist></div>
        <div className="field"><label htmlFor="r-model">Model <span className="req">*</span></label><input id="r-model" className="input" name="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Bullet 350" /></div>
      </div>
      <div className="field"><label htmlFor="r-year">Year <span className="req">*</span></label><input id="r-year" className="input" name="year" inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value)} /></div>
      <div className="field">
        <label htmlFor="r-cond">Current condition <span className="req">*</span></label>
        <textarea id="r-cond" name="condition" placeholder="Running or not, rust, missing parts, original paint…" />
      </div>
      <div className="field">
        <span className="label">What do you need? <span className="req">*</span></span>
        <div className="subnav">
          {NEEDS.map((n) => (
            <button key={n} type="button" className="chip" aria-pressed={needs.includes(n)} onClick={() => setNeeds((c) => (c.includes(n) ? c.filter((x) => x !== n) : [...c, n]))}>{n}</button>
          ))}
        </div>
        <textarea name="requirementsText" placeholder="Anything else — colours, period-correct parts, budget, timeline…" style={{ minHeight: 80 }} />
      </div>
      <ImagePicker files={files} onChange={setFiles} max={maxImages} maxMb={maxMb} label="Photos of your vehicle" />
      <div className="row2">
        <div className="field"><label htmlFor="r-name">Name <span className="req">*</span></label><input id="r-name" className="input" name="name" autoComplete="name" /></div>
        <div className="field"><label htmlFor="r-phone">Phone / WhatsApp <span className="req">*</span></label><input id="r-phone" className="input" name="phone" type="tel" autoComplete="tel" /></div>
      </div>
      <div className="row2">
        <div className="field"><label htmlFor="r-email">Email</label><input id="r-email" className="input" name="email" type="email" autoComplete="email" /></div>
        <div className="field"><label htmlFor="r-city">City</label><input id="r-city" className="input" name="city" autoComplete="address-level2" /></div>
      </div>
      <p className="notice">A request does not guarantee service — every restoration is subject to inspection and approval.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      <button className="btn dark block" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Request Restoration'}</button>
      <WhatsAppButton
        number={whatsapp}
        className="btn wa block"
        message={restorationMessage({ vehicleType: type, model, year, url: pageUrl })}
        lead={{ module: MODULES.restoration, itemName: [type, model, year].filter(Boolean).join(' · ') || 'Restoration enquiry', category: type, pageUrl }}
      >
        Prefer WhatsApp? Chat with the workshop
      </WhatsAppButton>
    </form>
  );
}
