import { NextResponse } from 'next/server';
import { uid, writeDb } from '@/lib/db';
import { bad, pick, throttled, validPhone } from '@/lib/api';
import { addAddress, cleanAddress, getCurrentUser } from '@/lib/users';

class OrderError extends Error {}

export async function POST(req) {
  if (throttled(req, 15)) return bad('Too many requests, please try again later.', 429);
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || body.items.length === 0) return bad('Your cart is empty.');

  const customer = pick(body.customer || {}, ['name', 'phone', 'email', 'address', 'city', 'state', 'pincode'], 500);
  if (!customer.name || !customer.address || !customer.city || !customer.state) return bad('Please complete your delivery details.');
  if (!validPhone(customer.phone)) return bad('Please enter a valid phone number.');
  if (!/^[1-9]\d{5}$/.test(customer.pincode)) return bad('Please enter a valid pincode.');
  const user = await getCurrentUser();

  try {
    const order = await writeDb((db) => {
      if (body.payment === 'cod' && !db.settings.codEnabled) throw new OrderError('Cash on delivery is not available.');
      // Prices and stock always come from the server, never from the client cart.
      const items = body.items.map(({ id, qty }) => {
        const p = db.parts.find((x) => x.id === id && x.published);
        const n = Math.max(1, Math.floor(Number(qty) || 1));
        if (!p) throw new OrderError('An item in your cart is no longer available.');
        if (p.mode !== 'checkout' || !(p.price > 0)) throw new OrderError(`${p.title} is available on enquiry only.`);
        if (p.stock < n) throw new OrderError(p.stock > 0 ? `Only ${p.stock} × ${p.title} left in stock.` : `${p.title} is out of stock.`);
        return { part: p, line: { partId: p.id, slug: p.slug, title: p.title, sku: p.sku, price: p.price, qty: n, image: p.images?.[0] || '' } };
      });
      items.forEach(({ part, line }) => (part.stock -= line.qty));

      const subtotal = items.reduce((s, { line }) => s + line.price * line.qty, 0);
      const shipping = subtotal >= db.settings.freeShippingAbove ? 0 : db.settings.shippingFee;
      const number = `DW${String(1001 + db.orders.length)}`;
      const o = {
        id: uid('ord'),
        number,
        items: items.map((i) => i.line),
        subtotal,
        shipping,
        total: subtotal + shipping,
        customer,
        userId: user?.id || '',
        payment: body.payment === 'cod' ? 'cod' : 'whatsapp',
        status: 'new',
        notes: '',
        createdAt: new Date().toISOString(),
      };
      db.orders.unshift(o);
      const member = user?.kind === 'user' && body.saveAddress && db.users?.find((u) => u.id === user.id);
      if (member) {
        try {
          addAddress(member, cleanAddress(customer));
        } catch {
          // Address book full or incomplete — the order itself still goes through.
        }
      }
      return o;
    });
    return NextResponse.json({ id: order.id, number: order.number, total: order.total, payment: order.payment });
  } catch (e) {
    if (e instanceof OrderError) return bad(e.message, 409);
    throw e;
  }
}
