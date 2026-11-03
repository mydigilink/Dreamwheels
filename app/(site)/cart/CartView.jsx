'use client';
import Link from 'next/link';
import Img from '@/components/Img';
import { useCart } from '@/components/site/CartProvider';
import { QtyControl, ShippingProgress } from '@/components/site/CartDrawer';
import { formatINR, partUrl } from '@/lib/site';

export default function CartView() {
  const cart = useCart();
  if (!cart.ready) return <div className="wrap section" />;

  return (
    <div className="wrap" style={{ padding: '24px 0 60px' }}>
      <h1 style={{ fontSize: 'clamp(20px,3.5vw,32px)', marginBottom: 20 }}>Your cart</h1>
      {cart.items.length === 0 ? (
        <div className="empty">
          <h3>Your cart is empty</h3>
          <Link href="/spare-parts/" className="btn dark">Shop spare parts</Link>
        </div>
      ) : (
        <div className="split">
          <div className="panel">
            {cart.items.map((i) => (
              <div className="cart-line" key={i.id}>
                <Img src={i.image} alt="" />
                <div>
                  <Link href={partUrl(i)} className="t">{i.title}</Link>
                  <div className="muted" style={{ fontSize: 13 }}>SKU {i.sku} · {formatINR(i.price)}</div>
                  <div className="row">
                    <QtyControl value={i.qty} max={i.stock > 0 ? i.stock : 99} onChange={(q) => cart.setQty(i.id, q)} small />
                    <b>{formatINR(i.price * i.qty)}</b>
                  </div>
                  <button className="link-btn" onClick={() => cart.remove(i.id)} style={{ marginTop: 6 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="panel sticky" style={{ display: 'grid', gap: 12 }}>
            <h3>Order summary</h3>
            <ShippingProgress subtotal={cart.subtotal} freeAbove={cart.freeAbove} />
            <div className="summary-row"><span>Subtotal</span><span>{formatINR(cart.subtotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{cart.shipping ? formatINR(cart.shipping) : 'Free'}</span></div>
            <div className="summary-row total"><span>Total</span><span>{formatINR(cart.total)}</span></div>
            <Link href="/checkout/" className="btn dark block">Proceed to checkout</Link>
            <Link href="/spare-parts/" className="btn block ghost">Continue shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
}
