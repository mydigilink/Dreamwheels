'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.7-4.9h-4v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z" />
  </svg>
);

export const AUTH_ERRORS = {
  google_not_configured: 'Google sign-in is not set up yet. Please use email or continue as a guest.',
  facebook_not_configured: 'Facebook sign-in is not set up yet. Please use email or continue as a guest.',
  oauth_cancelled: 'Sign-in was cancelled.',
  oauth_failed: 'We couldn’t sign you in with that account. Please try again.',
};

export default function AuthForm({ mode, next = '/account/', initialError = '' }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [error, setError] = useState(AUTH_ERRORS[initialError] || '');
  const [busy, setBusy] = useState('');
  const q = next !== '/account/' ? `?next=${encodeURIComponent(next)}` : '';

  async function post(url, body, tag) {
    setBusy(tag);
    setError('');
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy('');
    }
  }

  function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (isRegister && f.password !== f.confirm) return setError('Passwords do not match.');
    post(isRegister ? '/api/auth/register/' : '/api/auth/login/', f, 'form');
  }

  return (
    <div className="panel auth-card">
      <h1>{isRegister ? 'Create account' : 'Sign in'}</h1>
      <p className="muted">{isRegister ? 'Track your orders and check out faster.' : 'Sign in to view your orders and saved details.'}</p>

      <div className="auth-social">
        <a className="btn block" href={`/api/auth/oauth/google/${q}`}><GoogleIcon /> Continue with Google</a>
        <a className="btn block" href={`/api/auth/oauth/facebook/${q}`}><FacebookIcon /> Continue with Facebook</a>
      </div>

      <div className="auth-or"><span>or with email</span></div>

      <form className="form" onSubmit={submit}>
        {isRegister && (
          <div className="field"><label htmlFor="a-name">Full name</label><input id="a-name" className="input" name="name" required autoComplete="name" /></div>
        )}
        <div className="field"><label htmlFor="a-email">Email</label><input id="a-email" className="input" name="email" type="email" required autoComplete="email" /></div>
        <div className="field">
          <label htmlFor="a-pass">Password</label>
          <input id="a-pass" className="input" name="password" type="password" required minLength={isRegister ? 8 : undefined} autoComplete={isRegister ? 'new-password' : 'current-password'} />
          {isRegister && <span className="hint">At least 8 characters.</span>}
        </div>
        {isRegister && (
          <div className="field"><label htmlFor="a-confirm">Confirm password</label><input id="a-confirm" className="input" name="confirm" type="password" required autoComplete="new-password" /></div>
        )}
        {error && <div className="notice error" role="alert">{error}</div>}
        <button className="btn dark block" disabled={Boolean(busy)}>
          {busy === 'form' ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <button type="button" className="btn ghost block" onClick={() => post('/api/auth/guest/', null, 'guest')} disabled={Boolean(busy)}>
        {busy === 'guest' ? 'Please wait…' : 'Continue as guest'}
      </button>

      <p className="auth-switch muted">
        {isRegister ? <>Already have an account? <Link href={`/login/${q}`}>Sign in</Link></> : <>New to DreamWheels? <Link href={`/register/${q}`}>Create an account</Link></>}
      </p>
    </div>
  );
}
