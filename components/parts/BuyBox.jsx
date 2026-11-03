'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../site/CartProvider';
import { QtyControl } from '../site/CartDrawer';
import { formatINR } from '@/lib/site';

export function PincodeCheck({ codEnabled }) {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  function check(e) {
    e.preventDefault();
    if (!/^[1-9]\d{5}$/.test(pin)) return setMsg('Enter a valid 6-digit pincode.');
    const eta = new Date(Date.now() + (pin.startsWith('4') ? 3 : 5) * 86400e3);
    setMsg(`Estimated delivery by ${eta.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}${codEnabled ? ' · COD available' : ''}`);
  }
  return (
    <form onSubmit={check}>
      <div className="pincode">
        <input className="input" inputMode="numeric" maxLength={6} placeholder="Check delivery pincode" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} aria-label="Pincode" />
        <button className="btn">Check</button>
      </div>
      {msg && <p style={{ fontSize: 13, marginTop: 8 }} className="muted">{msg}</p>}
    </form>
  );
}

export default function BuyBox({ part }) {
  const cart = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const max = part.stock > 0 ? part.stock : 1;

  function buyNow() {
    cart.add(part, qty, { openDrawer: false });
    router.push('/checkout/');
  }

  return (
    <>
      <div className="buy-row">
        <QtyControl value={qty} max={max} onChange={setQty} />
        <button className="btn dark" onClick={() => cart.add(part, qty)}>Add to cart · {formatINR(part.price * qty)}</button>
      </div>
      <button className="btn ink block" onClick={buyNow}>Buy it now</button>

      {/* Sticky mobile purchase bar */}
      <div className="sticky-cta">
        <button className="btn" onClick={() => cart.add(part, qty)}>Add to cart</button>
        <button className="btn dark" onClick={buyNow}>Buy now</button>
      </div>
    </>
  );
}
