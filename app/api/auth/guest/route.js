import { NextResponse } from 'next/server';
import { uid } from '@/lib/db';
import { bad, throttled } from '@/lib/api';
import { setUserCookie } from '@/lib/users';

// Guests get a signed session only — no account record is stored.
export async function POST(req) {
  if (throttled(req, 20)) return bad('Too many requests, please try again later.', 429);
  const guest = { id: uid('gst'), name: 'Guest', email: '', kind: 'guest' };
  return setUserCookie(NextResponse.json({ user: guest }), guest);
}
