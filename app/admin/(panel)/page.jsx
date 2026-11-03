import Link from 'next/link';
import { Toolbar, Pill, Avatar } from '@/components/admin/ui';
import { redirect } from 'next/navigation';
import { readDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { formatINR, timeAgo } from '@/lib/site';

export const metadata = { title: 'Dashboard' };

function Stat({ href, icon, color, label, value, detail }) {
  return (
    <Link href={href} className="m-stat">
      <div className="k"><span className="si" style={{ background: color }}>{icon}</span>{label}</div>
      <div className="v">{value}</div>
      <div className="d">{detail}</div>
    </Link>
  );
}

export default async function Dashboard() {
  if (!(await isAdmin())) redirect('/admin/login/');
  const db = await readDb();
  const weekAgo = Date.now() - 7 * 86400e3;
  const leadsWeek = db.leads.filter((l) => new Date(l.createdAt) > weekAgo);
  const revenue = db.orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const lowStock = db.parts.filter((p) => p.published && p.mode === 'checkout' && p.stock <= 3);
  const noVideo = db.vehicles.filter((v) => v.published && !v.video).length;

  const byModule = {};
  db.leads.forEach((l) => (byModule[l.module || 'Other'] = (byModule[l.module || 'Other'] || 0) + 1));
  const maxModule = Math.max(1, ...Object.values(byModule));
  const wa = db.leads.filter((l) => l.type === 'whatsapp').length;
  const hour = new Date().getHours();

  return (
    <>
      <Toolbar title="Dashboard">
        <Link href="/admin/vehicles/new/" className="m-btn primary">+ New Vehicle</Link>
      </Toolbar>
      <div className="m-content">
        <div className="m-page wide">
          <div className="m-hello">Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'} 👋</div>
          <p>Here’s what’s happening on DreamWheels.</p>

          <div className="m-stats">
            <Stat href="/admin/leads/" icon="✉" color="#0a84ff" label="Leads this week" value={leadsWeek.length} detail={`${db.leads.filter((l) => l.status === 'new').length} new · ${wa} via WhatsApp`} />
            <Stat href="/admin/orders/" icon="🛒" color="#30d158" label="Orders" value={db.orders.length} detail={`${formatINR(revenue)} total`} />
            <Stat href="/admin/submissions/" icon="⇄" color="#ff375f" label="Sell requests" value={db.submissions.filter((s) => s.status === 'pending').length} detail="awaiting review" />
            <Stat href="/admin/restorations/" icon="🔧" color="#ac8e68" label="Restoration" value={db.restorations.filter((r) => r.status === 'new').length} detail="new requests" />
            <Stat href="/admin/vehicles/" icon="🏍" color="#bf5af2" label="Live vehicles" value={db.vehicles.filter((v) => v.published).length} detail={`${db.vehicles.filter((v) => v.availability === 'Sold').length} sold`} />
            <Stat href="/admin/parts/" icon="⚙" color="#ff9f0a" label="Spare parts" value={db.parts.filter((p) => p.published).length} detail={`${lowStock.length} low on stock`} />
          </div>

          <div className="m-quick">
            <Link href="/admin/vehicles/new/" className="m-btn">🏍 Add vehicle</Link>
            <Link href="/admin/parts/new/" className="m-btn">⚙ Add spare part</Link>
            <Link href="/admin/blog/new/" className="m-btn">✎ Write blog post</Link>
            <a href="/api/admin/export/leads/" className="m-btn">⬇ Export leads (CSV)</a>
          </div>

          {(noVideo > 0 || lowStock.length > 0) && (
            <div style={{ marginTop: 16 }}>
              {noVideo > 0 && <div className="m-warn">▶ {noVideo} live vehicle{noVideo > 1 ? 's have' : ' has'} no video yet — video is mandatory on vehicle pages. <Link href="/admin/vehicles/" style={{ textDecoration: 'underline' }}>Review</Link></div>}
              {lowStock.length > 0 && <div className="m-warn">📦 Low stock: {lowStock.map((p) => `${p.title} (${p.stock})`).join(', ')}</div>}
            </div>
          )}

          <div className="m-cols">
            <div className="m-card">
              <h3>Recent leads <Link href="/admin/leads/">Show all</Link></h3>
              {db.leads.slice(0, 6).map((l) => (
                <Link key={l.id} href={`/admin/leads/?id=${l.id}`} className="m-list-item">
                  <Avatar name={l.name || (l.type === 'whatsapp' ? 'W A' : '?')} />
                  <div className="grow">
                    <b>{l.name || (l.type === 'whatsapp' ? 'WhatsApp click' : 'Anonymous')} · {l.itemName}</b>
                    <span>{l.module} · {timeAgo(l.createdAt)}</span>
                  </div>
                  <Pill status={l.type === 'whatsapp' ? 'approved' : 'new'}>{l.type === 'whatsapp' ? 'WhatsApp' : 'Form'}</Pill>
                </Link>
              ))}
              {db.leads.length === 0 && <div className="m-list-item"><span className="grow" style={{ color: 'var(--m-text-2)' }}>No leads yet</span></div>}
            </div>

            <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
              <div className="m-card">
                <h3>Leads by source</h3>
                {Object.entries(byModule).map(([m, n]) => (
                  <div key={m} className="m-list-item" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{m}</span><b>{n}</b></div>
                    <div className="m-bar"><div style={{ width: `${(n / maxModule) * 100}%`, background: '#0a84ff' }} /></div>
                  </div>
                ))}
                {db.leads.length === 0 && <div className="m-list-item"><span style={{ color: 'var(--m-text-2)' }}>No data yet</span></div>}
              </div>
              <div className="m-card">
                <h3>Latest orders <Link href="/admin/orders/">Show all</Link></h3>
                {db.orders.slice(0, 4).map((o) => (
                  <Link key={o.id} href={`/admin/orders/?id=${o.id}`} className="m-list-item">
                    <div className="grow"><b>{o.number} · {o.customer.name}</b><span>{o.items.length} item(s) · {timeAgo(o.createdAt)}</span></div>
                    <b>{formatINR(o.total)}</b>
                    <Pill status={o.status} />
                  </Link>
                ))}
                {db.orders.length === 0 && <div className="m-list-item"><span style={{ color: 'var(--m-text-2)' }}>No orders yet</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
