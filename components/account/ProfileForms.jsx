'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function send(url, method, body) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function useStatus() {
  const [status, setStatus] = useState({ busy: false, error: '', ok: '' });
  return [
    status,
    async (fn, okMsg) => {
      setStatus({ busy: true, error: '', ok: '' });
      try {
        await fn();
        setStatus({ busy: false, error: '', ok: okMsg });
        return true;
      } catch (e) {
        setStatus({ busy: false, error: e.message, ok: '' });
        return false;
      }
    },
  ];
}

const Status = ({ s }) => (
  <>
    {s.error && <div className="notice error" role="alert">{s.error}</div>}
    {s.ok && <div className="notice ok" role="status">{s.ok}</div>}
  </>
);

export function ProfileForm({ profile }) {
  const router = useRouter();
  const [s, run] = useStatus();
  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(async () => {
      await send('/api/account/profile/', 'PATCH', {
        name: f.get('name'),
        phone: f.get('phone'),
        prefs: { whatsapp: f.get('pw') === 'on', email: f.get('pe') === 'on' },
      });
      router.refresh();
    }, 'Profile saved.');
  }
  return (
    <form className="form" onSubmit={submit}>
      <div className="row2">
        <div className="field"><label htmlFor="p-name">Full name</label><input id="p-name" className="input" name="name" defaultValue={profile.name} required autoComplete="name" /></div>
        <div className="field"><label htmlFor="p-phone">Phone</label><input id="p-phone" className="input" name="phone" type="tel" defaultValue={profile.phone || ''} placeholder="+91" autoComplete="tel" /></div>
      </div>
      <div className="field">
        <label htmlFor="p-email">Email</label>
        <input id="p-email" className="input" value={profile.email || 'Not provided'} disabled />
        <span className="hint">{profile.provider === 'email' ? 'Your sign-in email cannot be changed here. Contact us if you need to update it.' : `Signed in with ${profile.provider === 'google' ? 'Google' : 'Facebook'}.`}</span>
      </div>
      <fieldset className="pref-group">
        <legend>Updates</legend>
        <label className="check"><input type="checkbox" name="pw" defaultChecked={profile.prefs?.whatsapp} /> Order and request updates on WhatsApp</label>
        <label className="check"><input type="checkbox" name="pe" defaultChecked={profile.prefs?.email} /> New arrivals and offers by email</label>
      </fieldset>
      <Status s={s} />
      <div><button className="btn dark" disabled={s.busy}>{s.busy ? 'Saving…' : 'Save changes'}</button></div>
    </form>
  );
}

export function PasswordForm({ hasPassword }) {
  const [s, run] = useStatus();
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get('password') !== f.get('confirm')) return run(async () => { throw new Error('New passwords do not match.'); });
    const ok = await run(() => send('/api/account/password/', 'POST', { current: f.get('current'), password: f.get('password') }), hasPassword ? 'Password updated.' : 'Password set. You can now also sign in with your email.');
    if (ok) form.reset();
  }
  return (
    <form className="form" onSubmit={submit}>
      {!hasPassword && <p className="muted" style={{ margin: 0 }}>Your account uses social sign-in. Set a password to also sign in with your email address.</p>}
      {hasPassword && (
        <div className="field"><label htmlFor="pw-cur">Current password</label><input id="pw-cur" className="input" name="current" type="password" required autoComplete="current-password" /></div>
      )}
      <div className="row2">
        <div className="field"><label htmlFor="pw-new">New password</label><input id="pw-new" className="input" name="password" type="password" required minLength={8} autoComplete="new-password" /></div>
        <div className="field"><label htmlFor="pw-con">Confirm new password</label><input id="pw-con" className="input" name="confirm" type="password" required autoComplete="new-password" /></div>
      </div>
      <Status s={s} />
      <div><button className="btn" disabled={s.busy}>{s.busy ? 'Saving…' : hasPassword ? 'Change password' : 'Set password'}</button></div>
    </form>
  );
}

export function DeleteAccount({ hasPassword }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [s, run] = useStatus();
  function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(async () => {
      await send('/api/account/', 'DELETE', { confirm: f.get('confirm'), password: f.get('password') });
      router.replace('/');
      router.refresh();
    }, '');
  }
  if (!open)
    return (
      <div className="danger-row">
        <div>
          <b>Delete account</b>
          <p className="muted">Permanently remove your login, saved items and addresses. Existing orders stay on record with us.</p>
        </div>
        <button type="button" className="btn danger" onClick={() => setOpen(true)}>Delete account</button>
      </div>
    );
  return (
    <form className="form" onSubmit={submit}>
      <b>This cannot be undone.</b>
      {hasPassword && (
        <div className="field"><label htmlFor="d-pass">Your password</label><input id="d-pass" className="input" name="password" type="password" required autoComplete="current-password" /></div>
      )}
      <div className="field"><label htmlFor="d-conf">Type DELETE to confirm</label><input id="d-conf" className="input" name="confirm" required autoComplete="off" /></div>
      <Status s={s} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn danger" disabled={s.busy}>{s.busy ? 'Deleting…' : 'Permanently delete'}</button>
        <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
