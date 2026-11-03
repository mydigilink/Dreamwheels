'use client';
import { useState } from 'react';

/**
 * Short enquiry form. The item reference (name, id, category, page URL, module) is attached
 * automatically — identical to the WhatsApp payload — so the user never picks it from a dropdown.
 */
export default function EnquiryForm({ context, title = 'Enquire about this vehicle', defaultMessage = '', topics, subtitle }) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [topic, setTopic] = useState(topics?.[0] || '');
  // With topics (contact page) the chosen topic becomes the lead's subject so the admin can sort enquiries.
  const ctx = topics ? { ...context, itemName: topic, category: topic } : context;

  async function submit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!/^[+\d][\d\s-]{7,}$/.test(data.phone || '')) {
      setError('Please enter a valid phone number.');
      return;
    }
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'form', ...ctx, ...data }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Something went wrong');
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }

  if (state === 'done')
    return (
      <div className="success-box">
        <div className="tick">✓</div>
        <h3>Thank you</h3>
        <p className="muted">We’ve received your enquiry about <b>{ctx.itemName}</b> and will get back to you shortly.</p>
      </div>
    );

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h3>{title}</h3>
      {subtitle && <p className="muted" style={{ margin: '-6px 0 0' }}>{subtitle}</p>}
      {topics ? (
        <div className="field">
          <span className="label">What can we help with?</span>
          <div className="subnav" role="radiogroup">
            {topics.map((t) => (
              <button key={t} type="button" role="radio" aria-checked={topic === t} aria-pressed={topic === t} className="chip" onClick={() => setTopic(t)}>{t}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="ctx-note">Regarding: <b>{context.itemName}</b>{context.category ? ` · ${context.category}` : ''}</div>
      )}
      <div className="field">
        <label htmlFor="enq-name">Name <span className="req">*</span></label>
        <input id="enq-name" className="input" name="name" required autoComplete="name" />
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="enq-phone">Phone / WhatsApp <span className="req">*</span></label>
          <input id="enq-phone" className="input" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="+91" />
        </div>
        <div className="field">
          <label htmlFor="enq-email">Email</label>
          <input id="enq-email" className="input" name="email" type="email" autoComplete="email" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="enq-msg">Message</label>
        <textarea id="enq-msg" name="message" defaultValue={defaultMessage} placeholder="Questions on price, condition, customisation…" />
      </div>
      {error && <div className="notice error">{error}</div>}
      <button className="btn dark block" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
    </form>
  );
}
