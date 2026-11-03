'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Toolbar, SearchField, Seg, Pill, Toggle, Empty, api, useCollection } from '@/components/admin/ui';
import { useShell } from '@/components/admin/AdminShell';
import { formatINR } from '@/lib/site';

const CATS = [['all', 'All'], ['vintage-bikes', 'Bikes'], ['vintage-scooters', 'Scooters'], ['vintage-cars', 'Cars'], ['sports-bikes', 'Sports']];

export default function VehiclesPage() {
  const router = useRouter();
  const shell = useShell();
  const { items, setItems, error } = useCollection('vehicles');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const list = useMemo(() => {
    if (!items) return [];
    const t = q.toLowerCase();
    return items.filter((v) => (cat === 'all' || v.category === cat) && (!t || `${v.title} ${v.brand} ${v.year}`.toLowerCase().includes(t)));
  }, [items, q, cat]);

  async function togglePublished(v) {
    try {
      const saved = await api(`/api/admin/vehicles/${v.id}/`, { method: 'PUT', body: { published: !v.published } });
      setItems((all) => all.map((x) => (x.id === v.id ? saved : x)));
      shell.notify(saved.published ? 'Published' : 'Moved to drafts');
    } catch (e) {
      shell.notify(e.message, 'err');
    }
  }

  return (
    <>
      <Toolbar title="Vehicles" sub={items ? `${items.length} total` : ''}>
        <SearchField value={q} onChange={setQ} placeholder="Search vehicles" />
        <Link href="/admin/vehicles/new/" className="m-btn primary">+ <span className="m-hide-mobile">New Vehicle</span></Link>
      </Toolbar>
      <div className="m-content">
        <div style={{ marginBottom: 12 }}><Seg value={cat} options={CATS} onChange={setCat} /></div>
        {error && <div className="m-warn">{error}</div>}
        {items && list.length === 0 ? (
          <Empty icon="🏍" title="No vehicles found"><Link href="/admin/vehicles/new/" className="m-btn primary">Add a vehicle</Link></Empty>
        ) : (
          <div className="m-tablewrap">
            <table className="m-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>Vehicle</th>
                  <th className="m-hide-mobile">Category</th>
                  <th className="num m-hide-mobile">Price</th>
                  <th>Status</th>
                  <th className="m-hide-mobile">Media</th>
                  <th style={{ width: 70 }}>Live</th>
                </tr>
              </thead>
              <tbody>
                {list.map((v) => (
                  <tr key={v.id} className="click" onClick={() => router.push(`/admin/vehicles/${v.id}/`)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <td><img className="thumb" src={v.images?.[0] || ''} alt="" /></td>
                    <td>
                      <div className="t">{v.title}</div>
                      <div className="s">{v.brand} · {v.year}{v.source === 'sell-your-vehicle' ? ' · from owner' : ''}{v.featured ? ' · ★ featured' : ''}</div>
                    </td>
                    <td className="m-hide-mobile s">{CATS.find((c) => c[0] === v.category)?.[1]}</td>
                    <td className="num m-hide-mobile">{formatINR(v.price)}</td>
                    <td><Pill status={v.availability} /></td>
                    <td className="m-hide-mobile s">{v.images?.length || 0} 📷 {v.video ? '· ▶' : <span style={{ color: 'var(--m-orange)' }}>· no video</span>}{v.spin360?.length >= 8 ? ' · 360°' : ''}</td>
                    <td onClick={(e) => e.stopPropagation()}><Toggle on={v.published} onChange={() => togglePublished(v)} label="Published" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items && <div style={{ padding: 20, color: 'var(--m-text-2)' }}>Loading…</div>}
          </div>
        )}
      </div>
    </>
  );
}
