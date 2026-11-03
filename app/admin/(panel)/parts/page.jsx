'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Toolbar, SearchField, Seg, Pill, Toggle, Empty, api, useCollection } from '@/components/admin/ui';
import { useShell } from '@/components/admin/AdminShell';
import { formatINR } from '@/lib/site';

export default function PartsPage() {
  const router = useRouter();
  const shell = useShell();
  const { items, setItems } = useCollection('parts');
  const [q, setQ] = useState('');
  const [view, setView] = useState('all');

  const list = useMemo(() => {
    if (!items) return [];
    const t = q.toLowerCase();
    return items.filter((p) => {
      if (view === 'low' && !(p.mode === 'checkout' && p.stock <= 3)) return false;
      if (view === 'enquiry' && p.mode !== 'enquiry') return false;
      if (view === 'draft' && p.published) return false;
      return !t || `${p.title} ${p.sku} ${p.category} ${(p.compatibility || []).join(' ')}`.toLowerCase().includes(t);
    });
  }, [items, q, view]);

  async function patch(p, body, msg) {
    try {
      const saved = await api(`/api/admin/parts/${p.id}/`, { method: 'PUT', body });
      setItems((all) => all.map((x) => (x.id === p.id ? saved : x)));
      shell.notify(msg);
    } catch (e) {
      shell.notify(e.message, 'err');
    }
  }

  async function quickStock(p) {
    const v = window.prompt(`Stock for ${p.title}`, String(p.stock));
    if (v !== null && v.trim() !== '' && !Number.isNaN(Number(v))) patch(p, { stock: Number(v) }, 'Stock updated');
  }

  return (
    <>
      <Toolbar title="Spare Parts" sub={items ? `${items.length} products` : ''}>
        <SearchField value={q} onChange={setQ} placeholder="Search name, SKU, model" />
        <Link href="/admin/parts/new/" className="m-btn primary">+ <span className="m-hide-mobile">New Part</span></Link>
      </Toolbar>
      <div className="m-content">
        <div style={{ marginBottom: 12 }}>
          <Seg value={view} onChange={setView} options={[['all', 'All'], ['low', 'Low stock'], ['enquiry', 'Enquiry only'], ['draft', 'Drafts']]} />
        </div>
        {items && list.length === 0 ? (
          <Empty icon="⚙" title="No parts here"><Link href="/admin/parts/new/" className="m-btn primary">Add a part</Link></Empty>
        ) : (
          <div className="m-tablewrap">
            <table className="m-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>Product</th>
                  <th className="m-hide-mobile">Category</th>
                  <th className="num">Price</th>
                  <th className="num">Stock</th>
                  <th className="m-hide-mobile">Sold as</th>
                  <th style={{ width: 70 }}>Live</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="click" onClick={() => router.push(`/admin/parts/${p.id}/`)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <td><img className="thumb" src={p.images?.[0] || ''} alt="" /></td>
                    <td><div className="t">{p.title}</div><div className="s">{p.sku}</div></td>
                    <td className="m-hide-mobile s">{p.category}</td>
                    <td className="num">{formatINR(p.price)}{p.compareAt ? <div className="s" style={{ textDecoration: 'line-through' }}>{formatINR(p.compareAt)}</div> : null}</td>
                    <td className="num" onClick={(e) => { e.stopPropagation(); quickStock(p); }} title="Click to edit stock" style={{ cursor: 'pointer' }}>
                      <Pill status={p.stock <= 0 ? 'rejected' : p.stock <= 3 ? 'pending' : 'approved'}>{p.stock}</Pill>
                    </td>
                    <td className="m-hide-mobile s">{p.mode === 'checkout' ? 'Cart & checkout' : 'Enquiry'}</td>
                    <td onClick={(e) => e.stopPropagation()}><Toggle on={p.published} onChange={() => patch(p, { published: !p.published }, p.published ? 'Moved to drafts' : 'Published')} label="Published" /></td>
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
