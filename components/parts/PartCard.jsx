'use client';
import Link from 'next/link';
import Img from '../Img';
import { useCart } from '../site/CartProvider';
import SaveButton from '../account/SaveButton';
import { discountPct, formatINR, partUrl } from '@/lib/site';

export function StockLabel({ stock }) {
  if (stock <= 0) return <span className="stock out-stock">● Out of stock</span>;
  if (stock <= 5) return <span className="stock low-stock">● Only {stock} left</span>;
  return <span className="stock in-stock">● In stock</span>;
}

export function PriceRow({ price, compareAt }) {
  const pct = discountPct(price, compareAt);
  return (
    <div className="price-row">
      <span className="now">{price ? formatINR(price) : 'Price on request'}</span>
      {pct > 0 && <span className="was">{formatINR(compareAt)}</span>}
      {pct > 0 && <span className="save">-{pct}%</span>}
    </div>
  );
}

export default function PartCard({ p }) {
  const cart = useCart();
  const href = partUrl(p);
  const canBuy = p.mode === 'checkout' && p.stock > 0 && p.price > 0;
  const pct = discountPct(p.price, p.compareAt);
  return (
    <article className="pcard">
      <Link href={href} className="media" aria-label={p.title}>
        <Img src={p.images?.[0]} alt={p.title} />
        {pct > 0 && <span className="badge out">Save {pct}%</span>}
      </Link>
      <SaveButton type="part" id={p.id} title={p.title} />
      <div className="body">
        <span className="vendor">{p.category}</span>
        <h3><Link href={href}>{p.title}</Link></h3>
        <PriceRow price={p.price} compareAt={p.compareAt} />
        {p.mode === 'checkout' ? <StockLabel stock={p.stock} /> : <span className="stock low-stock">● Enquire for availability</span>}
      </div>
      <div className="foot">
        {canBuy ? (
          <button className="btn sm dark block" onClick={() => cart.add(p, 1)}>Add to cart</button>
        ) : (
          <Link href={`${href}#enquire`} className="btn sm block">Enquire</Link>
        )}
      </div>
    </article>
  );
}
