'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toolbar, SearchField, Seg, Pill, Empty, api, useCollection } from './ui';
import { useShell } from './AdminShell';
import { timeAgo } from '@/lib/site';

/**
 * Mail.app-style split view used for Leads, Orders, Sell Requests and Restoration requests.
 * List on the left (filters + search), selected record on the right.
 */
export default function Inbox({ collection, title, icon, statuses, newStatus, filters = [], searchText, summary, Detail }) {
  const router = useRouter();
  const shell = useShell();
  const { items, setItems } = useCollection(collection);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [selId, setSelId] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) setSelId(id);
  }, []);

  const segs = [['all', 'All'], [newStatus, 'Unread'], ...filters.map((f) => [f.key, f.label])];
  const list = useMemo(() => {
    if (!items) return [];
    const t = q.toLowerCase();
    return items.filter((x) => {
      if (filter === newStatus && x.status !== newStatus) return false;
      const f = filters.find((ff) => ff.key === filter);
      if (f && !f.test(x)) return false;
      return !t || searchText(x).toLowerCase().includes(t);
    });
  }, [items, q, filter, filters, newStatus, searchText]);

  const sel = items?.find((x) => x.id === selId);

  async function update(body, msg = 'Updated') {
    try {
      const saved = await api(`/api/admin/${collection}/${sel.id}/`, { method: 'PUT', body });
      setItems((all) => all.map((x) => (x.id === saved.id ? saved : x)));
      shell.notify(msg);
      router.refresh();
      return saved;
    } catch (e) {
      shell.notify(e.message, 'err');
    }
  }

  async function remove() {
    if (!(await shell.confirm({ title: 'Delete this record?', message: 'This cannot be undone.', confirm: 'Delete', danger: true, icon: '🗑' }))) return;
    await api(`/api/admin/${collection}/${sel.id}/`, { method: 'DELETE' });
    setItems((all) => all.filter((x) => x.id !== sel.id));
    setSelId(null);
    shell.notify('Deleted');
    router.refresh();
  }

  const unreadCount = items?.filter((x) => x.status === newStatus).length || 0;

  return (
    <>
      <Toolbar title={title} sub={items ? `${items.length} total${unreadCount ? ` · ${unreadCount} unread` : ''}` : ''}>
        {sel && <button className="m-btn m-only-mobile" onClick={() => setSelId(null)}>‹ Back</button>}
        <a className="m-btn" href={`/api/admin/export/${collection}/`}>⬇ <span className="m-hide-mobile">Export CSV</span></a>
      </Toolbar>
      <div className="m-content flush">
        <div className={`m-split ${sel ? 'has-sel' : ''}`}>
          <div className="m-split-list">
            <div className="filters">
              <SearchField value={q} onChange={setQ} placeholder={`Search ${title.toLowerCase()}`} />
              <Seg value={filter} options={segs} onChange={setFilter} />
            </div>
            <div className="items">
              {!items && <div style={{ padding: 16, color: 'var(--m-text-2)' }}>Loading…</div>}
              {items && list.length === 0 && <Empty icon={icon} title="Nothing here" />}
              {list.map((x) => {
                const s = summary(x);
                return (
                  <button key={x.id} className={`m-mail ${x.status === newStatus ? 'unread' : ''} ${x.id === selId ? 'sel' : ''}`} onClick={() => setSelId(x.id)}>
                    <div className="row1"><b>{s.title}</b><time>{timeAgo(x.createdAt)}</time></div>
                    <div className="row2">{s.subtitle}</div>
                    <div className="row3">{s.preview}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="m-split-detail">
            {sel ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  <Seg value={sel.status} options={statuses} onChange={(v) => update({ status: v }, `Marked as ${v}`)} />
                  <button className="m-btn danger" onClick={remove}>Delete</button>
                </div>
                <Detail item={sel} update={update} />
                <div className="m-section-title">Internal notes</div>
                <NotesField key={sel.id} value={sel.notes || ''} onSave={(notes) => update({ notes }, 'Notes saved')} />
              </>
            ) : (
              <Empty icon={icon} title={`Select an item to view`} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function NotesField({ value, onSave }) {
  const [v, setV] = useState(value);
  return (
    <div>
      <textarea className="m-textarea" value={v} onChange={(e) => setV(e.target.value)} placeholder="Add a private note (only visible to admins)…" />
      {v !== value && <button className="m-btn primary" style={{ marginTop: 8 }} onClick={() => onSave(v)}>Save note</button>}
    </div>
  );
}

export { Pill };
