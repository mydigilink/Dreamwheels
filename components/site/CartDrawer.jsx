'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from './CartProvider';
import { CloseIcon } from '../Icons';
import Img from '../Img';
import { formatINR, partUrl } from '@/lib/site';

export function QtyControl({ value, onChange, max = 99, small = false }) {
  return (
    <div className="qty" style={small ? { height: 36 } : undefined}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
      <input
        type="number"
        min="1"
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(max, Number(e.target.value) || 1)))}
        aria-label="Quantity"
      />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase quantity">+</button>
    </div>
  );
}

export function ShippingProgress({ subtotal, freeAbove }) {
  if (!subtotal) return null;
  const left = freeAbove - subtotal;
  return (
    <div className="ship-progress">
      {left > 0 ? <>Add <b>{formatINR(left)}</b> more for free shipping</> : <b className="in-stock">You’ve unlocked free shipping</b>}
      <div className="bar"><div style={{ width: `${Math.min(100, (subtotal / freeAbove) * 100)}%` }} /></div>
    </div>
  );
}

export default function CartDrawer() {
  const cart = useCart();

  useEffect(() => {
    if (!cart.open) return;
    const onKey = (e) => e.key === 'Escape' && cart.setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cart]);

  if (!cart.open) return null;
  return (
    <>
      <div className="drawer-backdrop" onClick={() => cart.setOpen(false)} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <header>
          <h3>Your cart</h3>
          <button className="icon-btn" onClick={() => cart.setOpen(false)} aria-label="Close cart"><CloseIcon /></button>
        </header>
        <div className="lines">
          {cart.items.length === 0 ? (
            <div className="empty" style={{ marginTop: 20 }}>
              <h3>Your cart is empty</h3>
              <p>Browse rare vintage spare parts.</p>
              <Link href="/spare-parts/" className="btn dark" onClick={() => cart.setOpen(false)}>Shop spare parts</Link>
            </div>
          ) : (
            cart.items.map((i) => (
              <div className="cart-line" key={i.id}>
                <Img src={i.image} alt="" />
                <div>
                  <Link href={partUrl(i)} className="t" onClick={() => cart.setOpen(false)}>{i.title}</Link>
                  <div className="muted" style={{ fontSize: 13 }}>{formatINR(i.price)}</div>
                  <div className="row">
                    <QtyControl value={i.qty} max={i.stock > 0 ? i.stock : 99} onChange={(q) => cart.setQty(i.id, q)} small />
                    <button className="link-btn" onClick={() => cart.remove(i.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.items.length > 0 && (
          <footer>
            <ShippingProgress subtotal={cart.subtotal} freeAbove={cart.freeAbove} />
            <div className="summary-row"><span>Subtotal</span><b>{formatINR(cart.subtotal)}</b></div>
            <Link href="/checkout/" className="btn dark block" onClick={() => cart.setOpen(false)}>Checkout · {formatINR(cart.total)}</Link>
            <Link href="/cart/" className="btn block ghost" onClick={() => cart.setOpen(false)}>View cart</Link>
          </footer>
        )}
      </aside>
    </>
  );
}
