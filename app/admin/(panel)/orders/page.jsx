'use client';
import Inbox from '@/components/admin/Inbox';
import { Avatar } from '@/components/admin/ui';
import { formatDateTime, formatINR } from '@/lib/site';
import { waLink } from '@/lib/whatsapp';

function OrderDetail({ item: o }) {
  const c = o.customer;
  return (
    <>
      <div className="m-detail-head">
        <Avatar name={c.name} />
        <div style={{ flex: 1 }}>
          <h2>Order {o.number}</h2>
          <p>{formatDateTime(o.createdAt)} · {o.payment === 'cod' ? 'Cash on delivery' : 'Pay on confirmation (UPI link)'}</p>
        </div>
        <h2>{formatINR(o.total)}</h2>
      </div>
      <div className="m-tablewrap" style={{ maxHeight: 'none' }}>
        <table className="m-table">
          <thead><tr><th></th><th>Item</th><th className="num">Qty</th><th className="num">Total</th></tr></thead>
          <tbody>
            {o.items.map((i) => (
              <tr key={i.partId}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <td style={{ width: 56 }}><img className="thumb" src={i.image} alt="" /></td>
                <td><div className="t">{i.title}</div><div className="s">{i.sku} · {formatINR(i.price)}</div></td>
                <td className="num">{i.qty}</td>
                <td className="num">{formatINR(i.price * i.qty)}</td>
              </tr>
            ))}
            <tr><td></td><td className="s">Subtotal</td><td></td><td className="num">{formatINR(o.subtotal)}</td></tr>
            <tr><td></td><td className="s">Shipping</td><td></td><td className="num">{o.shipping ? formatINR(o.shipping) : 'Free'}</td></tr>
            <tr><td></td><td><b>Total</b></td><td></td><td className="num"><b>{formatINR(o.total)}</b></td></tr>
          </tbody>
        </table>
      </div>
      <div className="m-section-title">Customer</div>
      <dl className="m-kv">
        <dt>Name</dt><dd>{c.name}</dd>
        <dt>Phone</dt><dd><a href={`tel:${c.phone}`}>{c.phone}</a></dd>
        {c.email && <><dt>Email</dt><dd><a href={`mailto:${c.email}`}>{c.email}</a></dd></>}
        <dt>Ship to</dt><dd>{c.address}<br />{c.city}, {c.state} — {c.pincode}</dd>
      </dl>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <a className="m-btn green" target="_blank" rel="noopener" href={waLink(c.phone, `Hi ${c.name}, thank you for your DreamWheels order ${o.number} (${formatINR(o.total)}). `)}>Message on WhatsApp</a>
        <a className="m-btn" href={`tel:${c.phone}`}>Call</a>
      </div>
    </>
  );
}

export default function OrdersPage() {
  return (
    <Inbox
      collection="orders"
      title="Orders"
      icon="🛒"
      newStatus="new"
      statuses={[['new', 'New'], ['confirmed', 'Confirmed'], ['shipped', 'Shipped'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']]}
      filters={[{ key: 'cod', label: 'COD', test: (o) => o.payment === 'cod' }]}
      searchText={(o) => `${o.number} ${o.customer.name} ${o.customer.phone} ${o.customer.city} ${o.items.map((i) => i.title).join(' ')}`}
      summary={(o) => ({ title: `${o.number} · ${o.customer.name}`, subtitle: `${formatINR(o.total)} · ${o.status}`, preview: o.items.map((i) => `${i.qty}× ${i.title}`).join(', ') })}
      Detail={OrderDetail}
    />
  );
}
