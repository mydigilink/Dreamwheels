'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Toolbar, SearchField, Seg, Toggle, Empty, api, useCollection } from '@/components/admin/ui';
import { useShell } from '@/components/admin/AdminShell';
import { BRAND_TYPES, brandInitials, brandKey } from '@/lib/brands';

const FILTERS = [['all', 'All'], ...BRAND_TYPES.map((t) => [t, `${t}s`]), ['nologo', 'No logo']];

export default function BrandsPage() {
  const router = useRouter();
  const shell = useShell();
  const { items, setItems, error } = useCollection('brands');
  const { items: vehicles } = useCollection('vehicles');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const usage = useMemo(() => {
    const m = {};
    for (const v of vehicles || []) m[brandKey(v.brand)] = (m[brandKey(v.brand)] || 0) + 1;
    return m;
  }, [vehicles]);

  const list = useMemo(() => {
    if (!items) return [];
    const t = q.toLowerCase();
    return [...items]
      .filter((b) => (filter === 'all' || (filter === 'nologo' ? !b.logo : b.types?.includes(filter))) && (!t || `${b.name} ${b.country}`.toLowerCase().includes(t)))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
  }, [items, q, filter]);

  async function patch(b, body, msg) {
    try {
      const saved = await api(`/api/admin/brands/${b.id}/`, { method: 'PUT', body });
      setItems((all) => all.map((x) => (x.id === b.id ? saved : x)));
      shell.notify(msg(saved));
    } catch (e) {
      shell.notify(e.message, 'err');
    }
  }

  const missingLogos = items ? items.filter((b) => !b.logo).length : 0;

  return (
    <>
      <Toolbar title="Brands" sub={items ? `${items.length} total` : ''}>
        <SearchField value={q} onChange={setQ} placeholder="Search brands" />
        <Link href="/admin/brands/new/" className="m-btn primary">+ <span className="m-hide-mobile">New Brand</span></Link>
      </Toolbar>
      <div className="m-content">
        <div style={{ marginBottom: 12 }}><Seg value={filter} options={FILTERS} onChange={setFilter} /></div>
        {error && <div className="m-warn">{error}</div>}
        {missingLogos > 0 && filter !== 'nologo' && (
          <div className="m-warn">{missingLogos} {missingLogos === 1 ? 'brand has' : 'brands have'} no logo yet — the website shows initials instead. Upload square PNG/SVG-style logos on a transparent or white background.</div>
        )}
        {items && list.length === 0 ? (
          <Empty icon="🏷" title="No brands found"><Link href="/admin/brands/new/" className="m-btn primary">Add a brand</Link></Empty>
        ) : (
          <div className="m-tablewrap">
            <table className="m-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}></th>
                  <th>Brand</th>
                  <th className="m-hide-mobile">Types</th>
                  <th className="num m-hide-mobile">Vehicles</th>
                  <th className="num m-hide-mobile">Order</th>
                  <th style={{ width: 80 }}>Featured</th>
                  <th style={{ width: 70 }}>Live</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id} className="click" onClick={() => router.push(`/admin/brands/${b.id}/`)}>
                    <td>
                      {b.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="thumb brand-thumb" src={b.logo} alt="" />
                      ) : (
                        <span className="thumb brand-thumb mono">{brandInitials(b.name)}</span>
                      )}
                    </td>
                    <td>
                      <div className="t">{b.name}</div>
                      <div className="s">{[b.country, b.founded && `est. ${b.founded}`].filter(Boolean).join(' · ') || '—'}</div>
                    </td>
                    <td className="m-hide-mobile s">{b.types?.join(', ') || 'All'}</td>
                    <td className="num m-hide-mobile">{usage[brandKey(b.name)] || 0}</td>
                    <td className="num m-hide-mobile s">{b.order}</td>
                    <td onClick={(e) => e.stopPropagation()}><Toggle on={b.featured} onChange={() => patch(b, { featured: !b.featured }, (s) => (s.featured ? 'Shown on home page' : 'Removed from home page'))} label="Featured" /></td>
                    <td onClick={(e) => e.stopPropagation()}><Toggle on={b.published} onChange={() => patch(b, { published: !b.published }, (s) => (s.published ? 'Published' : 'Hidden'))} label="Published" /></td>
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
