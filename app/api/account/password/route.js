import { NextResponse } from 'next/server';
import { bad, throttled } from '@/lib/api';
import { AccountError, checkPassword, hashPassword, requireCustomer, updateUser } from '@/lib/users';

// Change the password — or set a first one on a Google/Facebook account.
export async function POST(req) {
  if (throttled(req, 10, 15 * 60 * 1000)) return bad('Too many attempts. Try again in 15 minutes.', 429);
  const [user, deny] = await requireCustomer();
  if (deny) return deny;
  const { current, password } = await req.json().catch(() => ({}));
  if (typeof password !== 'string' || password.length < 8) return bad('New password must be at least 8 characters.');
  if (password.length > 200) return bad('Password is too long.');

  try {
    await updateUser(user.id, (u) => {
      if (u.password && !checkPassword(current || '', u.password)) throw new AccountError('Your current password is incorrect.', 401);
      u.password = hashPassword(password);
      u.passwordChangedAt = new Date().toISOString();
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AccountError) return bad(e.message, e.status);
    throw e;
  }
}
