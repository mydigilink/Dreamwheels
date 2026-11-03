import Link from 'next/link';
import { redirect } from 'next/navigation';
import Img from '@/components/Img';
import VehicleCard from '@/components/VehicleCard';
import PartCard from '@/components/parts/PartCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import LogoutButton from '@/components/auth/LogoutButton';
import AddressBook from '@/components/account/AddressBook';
import BuyAgain from '@/components/account/BuyAgain';
import { DeleteAccount, PasswordForm, ProfileForm } from '@/components/account/ProfileForms';
import { BoxIcon, GridIcon, HeartIcon, InboxIcon, LockIcon, PinIcon } from '@/components/Icons';
import { readDb } from '@/lib/db';
import { absUrl, formatDate, formatINR, partUrl } from '@/lib/site';
import { getCurrentUser, ownedRecords } from '@/lib/users';

export const metadata = { title: 'My account', robots: { index: false } };

const TABS = [
  { id: 'overview', label: 'Overview', Icon: GridIcon },
  { id: 'orders', label: 'Orders', Icon: BoxIcon },
  { id: 'requests', label: 'My requests', Icon: InboxIcon },
  { id: 'saved', label: 'Saved', Icon: HeartIcon, member: true },
  { id: 'addresses', label: 'Addresses', Icon: PinIcon, member: true },
  { id: 'profile', label: 'Profile & security', Icon: LockIcon, member: true },
];
const tabHref = (id) => (id === 'overview' ? '/account/' : `/account/?tab=${id}`);

const ORDER_STEPS = [['new', 'Placed'], ['confirmed', 'Confirmed'], ['shipped', 'Shipped'], ['delivered', 'Delivered']];
const STATUS = {
  orders: { new: 'Placed', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' },
  submissions: { pending: 'Under review', approved: 'Approved', rejected: 'Not accepted' },
  restorations: { new: 'Received', 'in-review': 'In review', contacted: 'Contacted', quoted: 'Quote sent', closed: 'Closed' },
  leads: { new: 'Received', contacted: 'Replied', closed: 'Closed' },
};
const TONE = { delivered: 'ok', approved: 'ok', quoted: 'ok', contacted: 'ok', cancelled: 'out', rejected: 'out' };

function StatusBadge({ kind, status }) {
  return <span className={`status-pill ${TONE[status] || ''}`}>{STATUS[kind][status] || status}</span>;
}

export default async function AccountPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login/?next=/account/');
  const { tab: wanted } = await searchParams;
  const guest = user.kind === 'guest';
  const tab = TABS.some((t) => t.id === wanted) ? wanted : 'overview';
  const locked = guest && TABS.find((t) => t.id === tab).member;

  const db = await readDb();
  const record = guest ? null : (db.users || []).find((u) => u.id === user.id);
  const mine = ownedRecords(db, user.id);
  const orders = mine.orders;
  const enquiries = mine.leads.filter((l) => l.type === 'form');
  const requestCount = mine.submissions.length + mine.restorations.length + enquiries.length;
  const saved = record?.saved || [];
  const catName = Object.fromEntries(db.categories.map((c) => [c.slug, c.name]));
  const savedVehicles = saved.filter((s) => s.type === 'vehicle').map((s) => db.vehicles.find((v) => v.id === s.id && v.published)).filter(Boolean);
  const savedParts = saved.filter((s) => s.type === 'part').map((s) => db.parts.find((p) => p.id === s.id && p.published)).filter(Boolean);
  const addresses = record?.addresses || [];
  const settings = db.settings;

  // Items from an order that can be bought again right now (live price/stock).
  const buyAgain = (o) =>
    o.items
      .map((i) => ({ part: db.parts.find((p) => p.id === i.partId && p.published && p.mode === 'checkout' && p.stock > 0 && p.price > 0), qty: i.qty }))
      .filter((x) => x.part)
      .map(({ part, qty }) => ({ part: { id: part.id, slug: part.slug, title: part.title, price: part.price, images: part.images, sku: part.sku, stock: part.stock }, qty }));

  const counts = { orders: orders.length, requests: requestCount, saved: savedVehicles.length + savedParts.length, addresses: addresses.length };

  return (
    <div className="wrap account-page">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>My account</span></nav>

      <div className="account-layout">
        <aside className="account-side">
          <div className="account-id">
            <div className="account-avatar">{(user.name || 'G').charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <b>{guest ? 'Guest' : user.name}</b>
              <small>{guest ? 'Not signed in' : user.email || 'Signed in'}</small>
            </div>
          </div>
          <nav className="account-nav" aria-label="Account">
            {TABS.map(({ id, label, Icon }) => (
              <Link key={id} href={tabHref(id)} className={id === tab ? 'active' : ''} aria-current={id === tab ? 'page' : undefined}>
                <Icon width={18} height={18} />
                <span>{label}</span>
                {counts[id] > 0 && <em>{counts[id]}</em>}
              </Link>
            ))}
          </nav>
          <div className="account-signout"><LogoutButton className="btn sm" /></div>
        </aside>

        <section className="account-main">
          {guest && (
            <div className="notice account-guest">
              <div>
                <b>You’re checking out as a guest.</b> Create an account to keep this order history, save vehicles and addresses, and check out faster.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link href="/register/?next=/account/" className="btn dark sm">Create account</Link>
                <Link href="/login/?next=/account/" className="btn sm">Sign in</Link>
              </div>
            </div>
          )}

          {locked && (
            <div className="panel empty-panel">
              <h2>Sign in to use {TABS.find((t) => t.id === tab).label.toLowerCase()}</h2>
              <p className="muted">Saved items, addresses and profile settings need an account. Anything you ordered as a guest moves across automatically when you sign up.</p>
              <Link href={`/register/?next=${encodeURIComponent(tabHref(tab))}`} className="btn dark">Create account</Link>
            </div>
          )}

          {!locked && tab === 'overview' && (
            <>
              <header className="account-title">
                <h1>{guest ? 'Your guest session' : `Hello, ${user.name.split(' ')[0]}`}</h1>
                <p className="muted">Track orders, follow up on requests and manage your details.</p>
              </header>

              <div className="account-stats">
                {[
                  ['orders', 'Orders', BoxIcon],
                  ['requests', 'Requests', InboxIcon],
                  ['saved', 'Saved items', HeartIcon],
                  ['addresses', 'Addresses', PinIcon],
                ].map(([id, label, Icon]) => (
                  <Link key={id} href={tabHref(id)} className="account-stat">
                    <Icon />
                    <b>{counts[id]}</b>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              {!guest && (!record?.phone || addresses.length === 0) && (
                <div className="notice">
                  Complete your profile to check out faster:{' '}
                  {!record?.phone && <Link href={tabHref('profile')} className="text-link">add your phone number</Link>}
                  {!record?.phone && addresses.length === 0 && ' · '}
                  {addresses.length === 0 && <Link href={tabHref('addresses')} className="text-link">save a delivery address</Link>}
                </div>
              )}

              <div className="panel">
                <div className="panel-head">
                  <h2>Latest order</h2>
                  {orders.length > 1 && <Link href={tabHref('orders')} className="text-link">View all orders</Link>}
                </div>
                {orders[0] ? <OrderSummary o={orders[0]} /> : <Empty text="You haven’t placed any orders yet." href="/spare-parts/" cta="Shop spare parts" />}
              </div>

              <div className="account-quick">
                <Link href="/vintage-bikes/" className="quick-link"><b>Browse vehicles</b><span>Vintage bikes, scooters and cars</span></Link>
                <Link href="/spare-parts/" className="quick-link"><b>Shop spare parts</b><span>Genuine parts, delivered</span></Link>
                <Link href="/sell-your-bike/" className="quick-link"><b>Sell your vehicle</b><span>Submit photos for review</span></Link>
                <Link href="/restoration/" className="quick-link"><b>Restoration quote</b><span>Get your classic assessed</span></Link>
              </div>
            </>
          )}

          {!locked && tab === 'orders' && (
            <>
              <header className="account-title"><h1>Orders</h1><p className="muted">{orders.length ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}` : 'No orders yet'}</p></header>
              {orders.length === 0 ? (
                <div className="panel"><Empty text="When you order spare parts, they’ll show up here." href="/spare-parts/" cta="Shop spare parts" /></div>
              ) : (
                <div className="order-list">
                  {orders.map((o, i) => (
                    <details key={o.id} className="order-card" open={i === 0}>
                      <summary>
                        <OrderSummary o={o} />
                      </summary>
                      <div className="order-body">
                        <OrderTracker status={o.status} />
                        <div className="order-lines">
                          {o.items.map((it) => (
                            <div key={it.partId} className="order-line">
                              <Img src={it.image} alt="" />
                              <div style={{ minWidth: 0 }}>
                                <Link href={partUrl(it)} className="t">{it.title}</Link>
                                <small className="muted">SKU {it.sku} · Qty {it.qty}</small>
                              </div>
                              <b>{formatINR(it.price * it.qty)}</b>
                            </div>
                          ))}
                        </div>
                        <div className="order-meta">
                          <div>
                            <small>Delivery address</small>
                            <p>{o.customer.name}<br />{o.customer.address}<br />{o.customer.city}, {o.customer.state} {o.customer.pincode}<br />{o.customer.phone}</p>
                          </div>
                          <div>
                            <small>Payment</small>
                            <p>{o.payment === 'cod' ? 'Cash on delivery' : 'Pay on confirmation (UPI link)'}</p>
                            <div className="summary-row"><span>Subtotal</span><span>{formatINR(o.subtotal)}</span></div>
                            <div className="summary-row"><span>Shipping</span><span>{o.shipping ? formatINR(o.shipping) : 'Free'}</span></div>
                            <div className="summary-row total"><span>Total</span><span>{formatINR(o.total)}</span></div>
                          </div>
                        </div>
                        <div className="order-actions">
                          <BuyAgain items={buyAgain(o)} />
                          <WhatsAppButton
                            number={settings.whatsapp}
                            className="btn sm"
                            message={`Hello DreamWheels,\n\nI need help with my order ${o.number} placed on ${formatDate(o.createdAt)}.`}
                            lead={{ module: 'Spare Parts', itemName: `Order ${o.number}`, itemId: o.id, category: 'Order support', pageUrl: absUrl('/account/?tab=orders') }}
                          >
                            Get help with this order
                          </WhatsAppButton>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </>
          )}

          {!locked && tab === 'requests' && (
            <>
              <header className="account-title"><h1>My requests</h1><p className="muted">Vehicles you’ve offered for sale, restoration requests and enquiries.</p></header>
              {requestCount === 0 ? (
                <div className="panel"><Empty text="You haven’t sent us any requests yet." href="/sell-your-bike/" cta="Sell your vehicle" /></div>
              ) : (
                <>
                  {mine.submissions.length > 0 && (
                    <RequestGroup title="Vehicles for sale">
                      {mine.submissions.map((s) => (
                        <RequestRow key={s.id} image={s.images?.[0]} title={`${s.year} ${s.brand} ${s.model}`} meta={`Submitted ${formatDate(s.createdAt)}${s.expectedPrice ? ` · Asking ${formatINR(s.expectedPrice)}` : ''}`} badge={<StatusBadge kind="submissions" status={s.status} />} />
                      ))}
                    </RequestGroup>
                  )}
                  {mine.restorations.length > 0 && (
                    <RequestGroup title="Restoration requests">
                      {mine.restorations.map((r) => (
                        <RequestRow key={r.id} image={r.images?.[0]} title={`${r.year} ${r.brand} ${r.model}`} meta={`${formatDate(r.createdAt)} · ${r.requirements}`} badge={<StatusBadge kind="restorations" status={r.status} />} />
                      ))}
                    </RequestGroup>
                  )}
                  {enquiries.length > 0 && (
                    <RequestGroup title="Enquiries">
                      {enquiries.map((l) => (
                        <RequestRow key={l.id} title={l.itemName || l.module || 'General enquiry'} meta={`${formatDate(l.createdAt)}${l.message ? ` · ${l.message}` : ''}`} badge={<StatusBadge kind="leads" status={l.status} />} />
                      ))}
                    </RequestGroup>
                  )}
                </>
              )}
            </>
          )}

          {!locked && tab === 'saved' && (
            <>
              <header className="account-title"><h1>Saved</h1><p className="muted">Tap the heart on any vehicle or part to keep it here.</p></header>
              {counts.saved === 0 ? (
                <div className="panel"><Empty text="Nothing saved yet." href="/vintage-bikes/" cta="Browse vehicles" /></div>
              ) : (
                <>
                  {savedVehicles.length > 0 && (
                    <section className="account-section">
                      <h2>Vehicles</h2>
                      <div className="grid account-grid">
                        {savedVehicles.map((v) => <VehicleCard key={v.id} v={v} categoryName={catName[v.category]} whatsapp={settings.whatsapp} />)}
                      </div>
                    </section>
                  )}
                  {savedParts.length > 0 && (
                    <section className="account-section">
                      <h2>Spare parts</h2>
                      <div className="pgrid account-grid">
                        {savedParts.map((p) => <PartCard key={p.id} p={p} />)}
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          )}

          {!locked && tab === 'addresses' && (
            <>
              <header className="account-title"><h1>Addresses</h1><p className="muted">Your default address is filled in automatically at checkout.</p></header>
              <div className="panel"><AddressBook initial={addresses} defaults={{ name: record.name, phone: record.phone }} /></div>
            </>
          )}

          {!locked && tab === 'profile' && (
            <>
              <header className="account-title"><h1>Profile & security</h1><p className="muted">Member since {formatDate(record.createdAt)}</p></header>
              <div className="panel"><h2>Personal details</h2><ProfileForm profile={{ name: record.name, email: record.email, phone: record.phone, provider: record.provider || 'email', prefs: record.prefs }} /></div>
              <div className="panel"><h2>{record.password ? 'Change password' : 'Set a password'}</h2><PasswordForm hasPassword={Boolean(record.password)} /></div>
              <div className="panel danger-zone"><DeleteAccount hasPassword={Boolean(record.password)} /></div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function OrderSummary({ o }) {
  return (
    <div className="order-summary">
      <div className="order-thumbs">
        {o.items.slice(0, 3).map((i) => <Img key={i.partId} src={i.image} alt="" />)}
      </div>
      <div style={{ minWidth: 0 }}>
        <b>Order {o.number}</b>
        <small className="muted">{formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.qty, 0)} items</small>
      </div>
      <div className="order-right">
        <b>{formatINR(o.total)}</b>
        <StatusBadge kind="orders" status={o.status} />
      </div>
    </div>
  );
}

function OrderTracker({ status }) {
  if (status === 'cancelled') return <div className="notice error">This order was cancelled. Contact us if you have any questions.</div>;
  const at = ORDER_STEPS.findIndex(([s]) => s === status);
  return (
    <ol className="tracker">
      {ORDER_STEPS.map(([s, label], i) => (
        <li key={s} className={i <= at ? 'done' : ''} aria-current={i === at ? 'step' : undefined}>
          <span />
          {label}
        </li>
      ))}
    </ol>
  );
}

const RequestGroup = ({ title, children }) => (
  <section className="panel request-group">
    <h2>{title}</h2>
    <div>{children}</div>
  </section>
);

const RequestRow = ({ image, title, meta, badge }) => (
  <div className="request-row">
    {image ? <Img src={image} alt="" /> : <span className="request-ph"><InboxIcon /></span>}
    <div style={{ minWidth: 0 }}>
      <b>{title}</b>
      <small className="muted">{meta}</small>
    </div>
    {badge}
  </div>
);

const Empty = ({ text, href, cta }) => (
  <div className="account-empty">
    <p className="muted">{text}</p>
    <Link href={href} className="btn dark sm">{cta}</Link>
  </div>
);
