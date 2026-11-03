import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, checkCredentials, createSession } from '@/lib/auth';
import { bad, throttled } from '@/lib/api';

export async function POST(req) {
  if (throttled(req, 10, 15 * 60 * 1000)) return bad('Too many attempts. Try again in 15 minutes.', 429);
  const { user, password } = await req.json().catch(() => ({}));
  if (!checkCredentials(user, password)) return bad('Incorrect username or password.', 401);
  const session = createSession(user);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  });
  return res;
}
