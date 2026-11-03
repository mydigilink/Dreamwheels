import { NextResponse } from 'next/server';
import { bad, throttled } from '@/lib/api';
import { claimGuestRecords, createUser, getCurrentUser, normEmail, publicUser, setUserCookie, validEmail } from '@/lib/users';

export async function POST(req) {
  if (throttled(req, 10, 15 * 60 * 1000)) return bad('Too many attempts. Try again in 15 minutes.', 429);
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 100);
  const email = normEmail(body.email);
  const password = String(body.password || '');
  if (!name) return bad('Please enter your name.');
  if (!validEmail(email)) return bad('Please enter a valid email address.');
  if (password.length < 8) return bad('Password must be at least 8 characters.');
  if (password.length > 200) return bad('Password is too long.');

  const user = await createUser({ name, email, password });
  if (!user) return bad('An account with this email already exists. Please sign in.', 409);
  const prev = await getCurrentUser();
  if (prev?.kind === 'guest') await claimGuestRecords(prev.id, user.id);
  return setUserCookie(NextResponse.json({ user: publicUser(user) }, { status: 201 }), publicUser(user));
}
