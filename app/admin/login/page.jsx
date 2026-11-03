'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/login/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user, password }) });
    setBusy(false);
    if (res.ok) {
      router.replace('/admin/');
      router.refresh();
    } else {
      setError((await res.json().catch(() => ({}))).error || 'Login failed');
      setShake(true);
      setTimeout(() => setShake(false), 450);
      setPassword('');
    }
  }

  return (
    <div className="m-login">
      <form className={`m-login-card ${shake ? 'shake' : ''}`} onSubmit={submit}>
        <div className="avatar">DW</div>
        <h1>DreamWheels Admin</h1>
        <p>Sign in to manage the website</p>
        <input className="m-input" value={user} onChange={(e) => setUser(e.target.value)} placeholder="Username" autoComplete="username" aria-label="Username" />
        <input className="m-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" autoComplete="current-password" autoFocus aria-label="Password" />
        <button className="m-btn primary lg" style={{ width: '100%', borderRadius: 17, marginTop: 4 }} disabled={busy || !password}>
          {busy ? 'Signing in…' : 'Sign In →'}
        </button>
        <div className="err" role="alert">{error}</div>
      </form>
    </div>
  );
}
