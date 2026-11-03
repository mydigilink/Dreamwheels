'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ className = 'btn sm' }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    await fetch('/api/auth/logout/', { method: 'POST' });
    router.replace('/');
    router.refresh();
  }
  return <button type="button" className={className} onClick={logout} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</button>;
}
