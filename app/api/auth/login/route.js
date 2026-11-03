import { NextResponse } from 'next/server';
import { bad, throttled } from '@/lib/api';
import { checkPassword, claimGuestRecords, findUserByEmail, getCurrentUser, publicUser, setUserCookie } from '@/lib/users';

export async function POST(req) {
  if (throttled(req, 10, 15 * 60 * 1000)) return bad('Too many attempts. Try again in 15 minutes.', 429);
  const { email, password } = await req.json().catch(() => ({}));
  const user = await findUserByEmail(email);
  if (user && !user.password) return bad(`This account uses ${user.provider === 'facebook' ? 'Facebook' : 'Google'} sign-in. Use that button below.`, 401);
  if (!user || !checkPassword(password || '', user.password)) return bad('Incorrect email or password.', 401);
  const prev = await getCurrentUser();
  if (prev?.kind === 'guest') await claimGuestRecords(prev.id, user.id);
  return setUserCookie(NextResponse.json({ user: publicUser(user) }), publicUser(user));
}
