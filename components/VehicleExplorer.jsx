'use client';
import { useEffect, useMemo, useState } from 'react';
import VehicleCard from './VehicleCard';
import { FilterIcon } from './Icons';

const decade = (y) => (y ? `${Math.floor(y / 10) * 10}s` : null);
const FILTERS = [
  { key: 'brand', label: 'Brand', get: (v) => v.brand },
  { key: 'decade', label: 'Year', get: (v) => decade(v.year) },
  { key: 'condition', label: 'Condition', get: (v) => v.condition },
  { key: 'availability', label: 'Availability', get: (v) => v.availability },
];
const SORTS = {
  newest: { label: 'Newest', fn: () => 0 },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => (b.price ?? -1) - (a.price ?? -1) },
  'year-asc': { label: 'Oldest first', fn: (a, b) => a.year - b.year },
  'year-desc': { label: 'Newest models', fn: (a, b) => b.year - a.year },
};

/**
 * Lightweight client-side filtering (spec §2.10.4): options are derived from the items in view,
 * so only relevant filters appear. State is mirrored to the query string for shareable views,
 * while the canonical URL stays the unfiltered page.
 */
export default function VehicleExplorer({ items, catNames, whatsapp }) {
  const [sel, setSel] = useState({});
  const [sort, setSort] = useState('newest');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const init = {};
    FILTERS.forEach((f) => {
      const v = q.get(f.key);
      if (v) init[f.key] = v.split(',');
    });
    setSel(init);
    if (q.get('sort') && SORTS[q.get('sort')]) setSort(q.get('sort'));
  }, []);

  useEffect(() => {
    // Keep params owned by the page (e.g. /search/?q=…), replace only our own.
    const q = new URLSearchParams(window.location.search);
    [...FILTERS.map((f) => f.key), 'sort'].forEach((k) => q.delete(k));
    Object.entries(sel).forEach(([k, v]) => v.length && q.set(k, v.join(',')));
    if (sort !== 'newest') q.set('sort', sort);
    const qs = q.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [sel, sort]);

  const options = useMemo(
    () =>
      FILTERS.map((f) => {
        const counts = {};
        items.forEach((v) => {
          const val = f.get(v);
          if (val) counts[val] = (counts[val] || 0) + 1;
        });
        return { ...f, values: Object.entries(counts).sort(([a], [b]) => String(a).localeCompare(String(b))) };
      }).filter((f) => f.values.length > 1),
    [items]
  );

  const filtered = useMemo(() => {
    const list = items.filter((v) => FILTERS.every((f) => !sel[f.key]?.length || sel[f.key].includes(f.get(v))));
    return sort === 'newest' ? list : [...list].sort(SORTS[sort].fn);
  }, [items, sel, sort]);

  const toggle = (key, val) =>
    setSel((s) => {
      const cur = s[key] || [];
      return { ...s, [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });
  const activeCount = Object.values(sel).reduce((n, v) => n + v.length, 0);

  return (
    <div className={options.length ? 'explorer' : ''}>
      {options.length > 0 && (
        <>
          {open && <div className="filters-backdrop" onClick={() => setOpen(false)} />}
          <aside className={`filters ${open ? 'open' : ''}`} aria-label="Filters">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 26 }}>Filter</h3>
              {activeCount > 0 && <button className="link-btn" onClick={() => setSel({})}>Clear all</button>}
            </div>
            {options.map((f) => (
              <div className="filter-group" key={f.key}>
                <h4>{f.label}</h4>
                <div className="opts">
                  {f.values.map(([val, n]) => (
                    <button key={val} type="button" className="chip" aria-pressed={!!sel[f.key]?.includes(val)} onClick={() => toggle(f.key, val)}>
                      {val} <small>{n}</small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {open && (
              <div className="filter-apply">
                <button className="btn block" onClick={() => setSel({})}>Clear</button>
                <button className="btn dark block" onClick={() => setOpen(false)}>Show {filtered.length} results</button>
              </div>
            )}
          </aside>
        </>
      )}
      <div>
        <div className="toolbar">
          <span className="muted" style={{ fontSize: 14 }}><b style={{ color: 'var(--ink)' }}>{filtered.length}</b> vehicles</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {options.length > 0 && (
              <button className="chip filter-toggle" onClick={() => setOpen(true)}>
                <FilterIcon width={16} height={16} /> Filter{activeCount ? ` (${activeCount})` : ''}
              </button>
            )}
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
            </select>
          </div>
        </div>
        {filtered.length ? (
          <div className="grid">
            {filtered.map((v, i) => (
              <VehicleCard key={v.id} v={v} categoryName={catNames[v.category]} whatsapp={whatsapp} eager={i < 2} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No vehicles match these filters</h3>
            <p>Try removing a filter, or tell us what you are looking for on WhatsApp.</p>
            <button className="btn" onClick={() => setSel({})}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
