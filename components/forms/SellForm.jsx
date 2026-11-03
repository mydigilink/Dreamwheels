'use client';
import { useState } from 'react';
import ImagePicker from './ImagePicker';
import { BikeIcon, CarIcon } from '../Icons';
import { STATES } from '@/lib/site';
import { brandsForType } from '@/lib/brands';

const STEPS = ['Vehicle', 'Details', 'Photos', 'Contact'];

/**
 * Step-based submission (spec §4.5–4.6). One form for bikes and cars; the fields adapt to the type.
 * Submissions are stored for admin review — nothing is published automatically.
 */
export default function SellForm({ maxImages = 6, maxMb = 8, brands = [] }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState('');
  const [v, setV] = useState({});
  const [files, setFiles] = useState([]);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const val = (k) => v[k] || '';

  function validate(n) {
    if (n === 0 && !type) return 'Please choose bike or car.';
    if (n === 1) {
      if (!v.brand || !v.model || !v.year || !v.registrationState || !v.condition) return 'Please fill in all required fields.';
      const y = Number(v.year);
      if (!(y >= 1900 && y <= new Date().getFullYear())) return 'Please enter a valid year.';
    }
    if (n === 2 && files.length === 0) return 'Please add at least one photo.';
    if (n === 3) {
      if (!v.name) return 'Please enter your name.';
      if (!/^[+\d][\d\s-]{7,}$/.test(v.phone || '')) return 'Please enter a valid phone number.';
    }
    return '';
  }

  function next() {
    const err = validate(step);
    setError(err);
    if (!err) setStep((s) => s + 1);
  }

  async function submit(e) {
    e.preventDefault();
    const err = validate(3);
    if (err) return setError(err);
    setState('sending');
    setError('');
    const fd = new FormData();
    fd.set('vehicleType', type);
    Object.entries(v).forEach(([k, x]) => fd.set(k, x));
    files.forEach((f) => fd.append('images', f));
    fd.set('website', e.currentTarget.website?.value || '');
    try {
      const res = await fetch('/api/submissions/', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
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
        <h3>Submission under review</h3>
        <p className="muted">Thanks, {v.name}! Our team will review your {type.toLowerCase()} and contact you within 2 working days. Listing is subject to approval.</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="form">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      <div className="stepper" aria-hidden="true">{STEPS.map((s, i) => <div key={s} className={i <= step ? 'on' : ''} />)}</div>
      <div className="step-title">
        <h3>{['What are you selling?', `Tell us about your ${type.toLowerCase() || 'vehicle'}`, 'Add photos', 'Your contact details'][step]}</h3>
        <small>Step {step + 1} of {STEPS.length}</small>
      </div>

      {step === 0 && (
        <div className="seg">
          <button type="button" aria-pressed={type === 'Bike'} onClick={() => { setType('Bike'); setV((s) => ({ ...s, brand: '' })); setStep(1); setError(''); }}><span><BikeIcon /></span>Bike / Scooter</button>
          <button type="button" aria-pressed={type === 'Car'} onClick={() => { setType('Car'); setV((s) => ({ ...s, brand: '' })); setStep(1); setError(''); }}><span><CarIcon /></span>Car</button>
        </div>
      )}

      {step === 1 && (
        <>
          <div className="row2">
            <div className="field">
              <label htmlFor="s-brand">Brand <span className="req">*</span></label>
              <select id="s-brand" value={val('brand')} onChange={set('brand')}>
                <option value="" disabled>Select brand</option>
                {[...brandsForType(brands, type).map((b) => b.name), 'Other'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="s-model">Model <span className="req">*</span></label>
              <input id="s-model" className="input" value={val('model')} onChange={set('model')} placeholder={type === 'Car' ? 'e.g. 1100 Super Select' : 'e.g. Bullet 350'} />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="s-year">Year <span className="req">*</span></label>
              <input id="s-year" className="input" inputMode="numeric" maxLength={4} value={val('year')} onChange={set('year')} placeholder="e.g. 1972" />
            </div>
            <div className="field">
              <label htmlFor="s-state">Registration state <span className="req">*</span></label>
              <select id="s-state" value={val('registrationState')} onChange={set('registrationState')}>
                <option value="" disabled>Select state</option>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="s-km">{type === 'Car' ? 'Kilometres driven' : 'Odometer reading'}</label>
              <input id="s-km" className="input" inputMode="numeric" value={val('kmsDriven')} onChange={set('kmsDriven')} />
            </div>
            <div className="field">
              <label htmlFor="s-price">Expected price (₹)</label>
              <input id="s-price" className="input" inputMode="numeric" value={val('expectedPrice')} onChange={set('expectedPrice')} placeholder="Optional" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="s-cond">Condition <span className="req">*</span></label>
            <textarea id="s-cond" value={val('condition')} onChange={set('condition')} placeholder={type === 'Car' ? 'Engine, body, rust, interior, papers…' : 'Does it run? Original paint? Any missing parts? Papers?'} />
          </div>
        </>
      )}

      {step === 2 && <ImagePicker files={files} onChange={setFiles} max={maxImages} maxMb={maxMb} label="Photos of your vehicle" />}

      {step === 3 && (
        <>
          <div className="row2">
            <div className="field"><label htmlFor="s-name">Name <span className="req">*</span></label><input id="s-name" className="input" value={val('name')} onChange={set('name')} autoComplete="name" /></div>
            <div className="field"><label htmlFor="s-phone">Phone / WhatsApp <span className="req">*</span></label><input id="s-phone" className="input" type="tel" value={val('phone')} onChange={set('phone')} autoComplete="tel" /></div>
          </div>
          <div className="row2">
            <div className="field"><label htmlFor="s-email">Email</label><input id="s-email" className="input" type="email" value={val('email')} onChange={set('email')} autoComplete="email" /></div>
            <div className="field"><label htmlFor="s-city">City</label><input id="s-city" className="input" value={val('city')} onChange={set('city')} autoComplete="address-level2" /></div>
          </div>
          <p className="notice">Your submission is reviewed by our team first. Listing is subject to inspection and approval.</p>
        </>
      )}

      {error && <div className="notice error" role="alert">{error}</div>}

      {step > 0 && (
        <div className="step-nav">
          <button type="button" className="btn" onClick={() => { setStep((s) => s - 1); setError(''); }}>Back</button>
          {step < 3 ? (
            <button type="button" className="btn dark" onClick={next}>Continue</button>
          ) : (
            <button className="btn dark" disabled={state === 'sending'}>{state === 'sending' ? 'Submitting…' : 'Submit for review'}</button>
          )}
        </div>
      )}
    </form>
  );
}
