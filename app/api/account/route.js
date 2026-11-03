import { NextResponse } from 'next/server';
import { writeDb } from '@/lib/db';
import { bad, throttled } from '@/lib/api';
import { AccountError, USER_COOKIE, checkPassword, requireCustomer } from '@/lib/users';

// Permanently deletes the customer's account. Orders and requests stay with the business
// (they are needed for fulfilment and records) but are no longer linked to a login.
export async function DELETE(req) {
  if (throttled(req, 10, 15 * 60 * 1000)) return bad('Too many attempts. Try again in 15 minutes.', 429);
  const [user, deny] = await requireCustomer();
  if (deny) return deny;
  const { confirm, password } = await req.json().catch(() => ({}));
  if (confirm !== 'DELETE') return bad('Type DELETE to confirm.');

  try {
    await writeDb((db) => {
      const u = (db.users || []).find((x) => x.id === user.id);
      if (!u) throw new AccountError('Account not found.', 404);
      if (u.password && !checkPassword(password || '', u.password)) throw new AccountError('Your password is incorrect.', 401);
      db.users = db.users.filter((x) => x !== u);
      for (const c of ['orders', 'leads', 'submissions', 'restorations']) for (const r of db[c] || []) if (r.userId === u.id) r.userId = '';
    });
  } catch (e) {
    if (e instanceof AccountError) return bad(e.message, e.status);
    throw e;
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
