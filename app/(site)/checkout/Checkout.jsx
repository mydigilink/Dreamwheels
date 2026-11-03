'use client';
import Link from 'next/link';
import { useState } from 'react';
import Img from '@/components/Img';
import { CashIcon, ChatIcon } from '@/components/Icons';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useCart } from '@/components/site/CartProvider';
import { STATES, absUrl, formatINR } from '@/lib/site';

export default function Checkout({ codEnabled, whatsapp, user, profile }) {
  const addresses = profile?.addresses || [];
  const [addrId, setAddrId] = useState(() => (addresses.find((a) => a.isDefault) || addresses[0])?.id || 'new');
  // Fields are uncontrolled; re-keying the block on address change refills the defaults.
  const addr = addresses.find((a) => a.id === addrId) || { name: profile?.name || '', phone: profile?.phone || '' };
  const cart = useCart();
  const [payment, setPayment] = useState(codEnabled ? 'cod' : 'whatsapp');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const { saveAddress, ...customer } = Object.fromEntries(new FormData(e.currentTarget));
    if (!/^[+\d][\d\s-]{7,}$/.test(customer.phone || '')) return setError('Please enter a valid phone number.');
    if (!/^[1-9]\d{5}$/.test(customer.pincode || '')) return setError('Please enter a valid 6-digit pincode.');
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, payment, saveAddress: saveAddress === 'on', items: cart.items.map((i) => ({ id: i.id, qty: i.qty })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place order');
      setOrder(data);
      cart.clear();
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }

  if (order)
    return (
      <div className="wrap" style={{ maxWidth: 640, padding: '40px 0 80px' }}>
        <div className="panel success-box">
          <div className="tick">✓</div>
          <h3>Order {order.number} placed</h3>
          <p className="muted">Thank you! We’ll call you to confirm your order of {formatINR(order.total)}{order.payment === 'cod' ? ' (cash on delivery)' : ''}.</p>
          <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
            <WhatsAppButton
              number={whatsapp}
              className="btn wa block"
              message={`Hello DreamWheels,\n\nI just placed order ${order.number} for ${formatINR(order.total)}.\nLink: ${absUrl('/spare-parts/')}\n\nSource: Spare Parts`}
              lead={{ module: 'Spare Parts', itemName: `Order ${order.number}`, itemId: order.id, category: 'Order', pageUrl: absUrl('/checkout/') }}
            >
              Confirm on WhatsApp
            </WhatsAppButton>
            {user && <Link href="/account/?tab=orders" className="btn block">View in my account</Link>}
            <Link href="/spare-parts/" className="btn block">Continue shopping</Link>
          </div>
        </div>
      </div>
    );

  if (cart.ready && cart.items.length === 0)
    return (
      <div className="wrap section">
        <div className="empty"><h3>Your cart is empty</h3><Link href="/spare-parts/" className="btn dark">Shop spare parts</Link></div>
      </div>
    );

  return (
    <div className="wrap" style={{ padding: '24px 0 60px' }}>
      <h1 style={{ fontSize: 'clamp(20px,3.5vw,32px)', marginBottom: 20 }}>Checkout</h1>
      <div className="split">
        <form className="panel form" onSubmit={submit} noValidate>
          {!user && (
            <div className="notice">
              <Link href="/login/?next=/checkout/" style={{ fontWeight: 800 }}>Sign in</Link> or <Link href="/register/?next=/checkout/" style={{ fontWeight: 800 }}>create an account</Link> to track this order — or just fill in your details below to check out as a guest.
            </div>
          )}
          <h3>Delivery details</h3>
          {addresses.length > 0 && (
            <div className="addr-pick" role="radiogroup" aria-label="Delivery address">
              {addresses.map((a) => (
                <label key={a.id} className={addrId === a.id ? 'on' : ''}>
                  <input type="radio" name="addrPick" checked={addrId === a.id} onChange={() => setAddrId(a.id)} />
                  <span><b>{a.label}</b> {a.name}, {a.address}, {a.city} {a.pincode}</span>
                </label>
              ))}
              <label className={addrId === 'new' ? 'on' : ''}>
                <input type="radio" name="addrPick" checked={addrId === 'new'} onChange={() => setAddrId('new')} />
                <span><b>Use a new address</b></span>
              </label>
            </div>
          )}
          <div key={addrId} className="form">
            <div className="row2">
              <div className="field"><label htmlFor="c-name">Full name <span className="req">*</span></label><input id="c-name" className="input" name="name" required autoComplete="name" defaultValue={addr.name || ''} /></div>
              <div className="field"><label htmlFor="c-phone">Phone <span className="req">*</span></label><input id="c-phone" className="input" name="phone" type="tel" required autoComplete="tel" defaultValue={addr.phone || ''} /></div>
            </div>
            <div className="field"><label htmlFor="c-email">Email</label><input id="c-email" className="input" name="email" type="email" autoComplete="email" defaultValue={profile?.email || ''} /></div>
            <div className="field"><label htmlFor="c-addr">Address <span className="req">*</span></label><textarea id="c-addr" name="address" required autoComplete="street-address" style={{ minHeight: 80 }} defaultValue={addr.address || ''} /></div>
            <div className="row2">
              <div className="field"><label htmlFor="c-city">City <span className="req">*</span></label><input id="c-city" className="input" name="city" required autoComplete="address-level2" defaultValue={addr.city || ''} /></div>
              <div className="field"><label htmlFor="c-pin">Pincode <span className="req">*</span></label><input id="c-pin" className="input" name="pincode" inputMode="numeric" maxLength={6} required autoComplete="postal-code" defaultValue={addr.pincode || ''} /></div>
            </div>
            <div className="field">
              <label htmlFor="c-state">State <span className="req">*</span></label>
              <select id="c-state" name="state" required defaultValue={addr.state || ''}>
                <option value="" disabled>Select state</option>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {profile && addrId === 'new' && (
              <label className="check"><input type="checkbox" name="saveAddress" defaultChecked /> Save this address to my account</label>
            )}
          </div>

          <h3 style={{ marginTop: 10 }}>Payment</h3>
          <div className="seg">
            {codEnabled && <button type="button" aria-pressed={payment === 'cod'} onClick={() => setPayment('cod')}><span><CashIcon /></span>Cash on delivery</button>}
            <button type="button" aria-pressed={payment === 'whatsapp'} onClick={() => setPayment('whatsapp')}><span><ChatIcon /></span>Pay on confirmation (UPI link)</button>
          </div>
          {error && <div className="notice error">{error}</div>}
          <button className="btn dark block" disabled={state === 'sending' || !cart.ready}>{state === 'sending' ? 'Placing order…' : `Place order · ${formatINR(cart.total)}`}</button>
        </form>

        <div className="panel sticky" style={{ display: 'grid', gap: 12 }}>
          <h3>Your order</h3>
          {cart.items.map((i) => (
            <div key={i.id} className="cart-line" style={{ gridTemplateColumns: '56px 1fr' }}>
              <Img src={i.image} alt="" style={{ width: 56, height: 56 }} />
              <div>
                <div className="t">{i.title}</div>
                <div className="row" style={{ marginTop: 4 }}><span className="muted">Qty {i.qty}</span><b>{formatINR(i.price * i.qty)}</b></div>
              </div>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>{formatINR(cart.subtotal)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{cart.shipping ? formatINR(cart.shipping) : 'Free'}</span></div>
          <div className="summary-row total"><span>Total</span><span>{formatINR(cart.total)}</span></div>
        </div>
      </div>
    </div>
  );
}
