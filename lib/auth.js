import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, createSession, safeEqual, verifySession } from './session';

export { ADMIN_COOKIE, createSession };

export function checkCredentials(user, password) {
  const u = process.env.ADMIN_USER || 'admin';
  const p = process.env.ADMIN_PASSWORD || 'dreamwheels';
  return safeEqual(user || '', u) && safeEqual(password || '', p);
}

export async function isAdmin() {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value);
}

/** Returns a 401 response when the caller is not an admin, otherwise null. */
export async function requireAdmin() {
  return (await isAdmin()) ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
