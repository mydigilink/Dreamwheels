import { NextResponse } from 'next/server';
import { bad } from '@/lib/api';
import { AccountError, requireCustomer, updateUser } from '@/lib/users';

export async function PATCH(req) {
  const [user, deny] = await requireCustomer();
  if (deny) return deny;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 100);
  const phone = String(body.phone || '').trim().slice(0, 20);
  if (!name) return bad('Please enter your name.');
  if (phone && !/^[+\d][\d\s-]{7,}$/.test(phone)) return bad('Please enter a valid phone number.');

  try {
    await updateUser(user.id, (u) => {
      u.name = name;
      u.phone = phone;
      u.prefs = { whatsapp: Boolean(body.prefs?.whatsapp), email: Boolean(body.prefs?.email) };
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AccountError) return bad(e.message, e.status);
    throw e;
  }
}
