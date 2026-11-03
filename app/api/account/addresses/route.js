import { NextResponse } from 'next/server';
import { bad } from '@/lib/api';
import { AccountError, addAddress, cleanAddress, requireCustomer, updateUser } from '@/lib/users';

/** body: { action: 'save', address } | { action: 'delete' | 'default', id } */
export async function POST(req) {
  const [user, deny] = await requireCustomer();
  if (deny) return deny;
  const body = await req.json().catch(() => ({}));

  try {
    const addresses = await updateUser(user.id, (u) => {
      u.addresses ||= [];
      const find = (id) => {
        const a = u.addresses.find((x) => x.id === id);
        if (!a) throw new AccountError('Address not found.', 404);
        return a;
      };

      if (body.action === 'save') {
        const clean = cleanAddress(body.address);
        const makeDefault = Boolean(body.address?.isDefault);
        if (body.address?.id) {
          const a = find(body.address.id);
          Object.assign(a, clean);
          if (makeDefault) u.addresses.forEach((x) => (x.isDefault = x === a));
        } else {
          addAddress(u, clean, { makeDefault });
        }
      } else if (body.action === 'delete') {
        const a = find(body.id);
        u.addresses = u.addresses.filter((x) => x !== a);
        if (a.isDefault && u.addresses[0]) u.addresses[0].isDefault = true;
      } else if (body.action === 'default') {
        const a = find(body.id);
        u.addresses.forEach((x) => (x.isDefault = x === a));
      } else {
        throw new AccountError('Unknown action.');
      }
      return u.addresses;
    });
    return NextResponse.json({ addresses });
  } catch (e) {
    if (e instanceof AccountError) return bad(e.message, e.status);
    throw e;
  }
}
