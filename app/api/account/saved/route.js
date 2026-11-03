import { NextResponse } from 'next/server';
import { bad } from '@/lib/api';
import { AccountError, requireCustomer, updateUser } from '@/lib/users';

const TYPES = { vehicle: 'vehicles', part: 'parts' };
const MAX_SAVED = 200;

/** Save or unsave a vehicle / part. body: { type: 'vehicle' | 'part', id, saved: boolean } */
export async function POST(req) {
  const [user, deny] = await requireCustomer();
  if (deny) return deny;
  const { type, id, saved } = await req.json().catch(() => ({}));
  if (!TYPES[type] || typeof id !== 'string') return bad('Invalid item.');

  try {
    const list = await updateUser(user.id, (u, db) => {
      u.saved ||= [];
      u.saved = u.saved.filter((s) => !(s.type === type && s.id === id));
      if (saved) {
        if (!db[TYPES[type]].some((x) => x.id === id && x.published)) throw new AccountError('This item is no longer available.', 404);
        if (u.saved.length >= MAX_SAVED) throw new AccountError(`You can save up to ${MAX_SAVED} items.`);
        u.saved.unshift({ type, id, at: new Date().toISOString() });
      }
      return u.saved;
    });
    return NextResponse.json({ saved: list.map((s) => `${s.type}:${s.id}`) });
  } catch (e) {
    if (e instanceof AccountError) return bad(e.message, e.status);
    throw e;
  }
}
