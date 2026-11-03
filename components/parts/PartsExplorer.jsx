'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PartCard from './PartCard';
import BrandLogo from '../BrandLogo';
import { findBrand, partBrands } from '@/lib/brands';
import { FilterIcon, SearchIcon } from '../Icons';


const SORTS = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  discount: 'Biggest discount',
};

export default function PartsExplorer({ parts, brandMaster = [], initialQuery = '', initialCat = '' }) {
  const brandsOf = useCallback((p) => partBrands(p, brandMaster), [brandMaster]);
  const [q, setQ] = useState(initialQuery);
  const [cats, setCats] = useState(initialCat ? [initialCat] : []);
  const [brands, setBrands] = useState([]);
  const [inStock, setInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('featured');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (cats.length === 1) p.set('cat', cats[0]);
    const s = p.toString();
    window.history.replaceState(null, '', s ? `?${s}` : window.location.pathname);
  }, [q, cats]);

  const catOptions = useMemo(() => countBy(parts, (p) => [p.category]), [parts]);
  const brandOptions = useMemo(() => countBy(parts, brandsOf), [parts, brandsOf]);

  const filtered = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let list = parts.filter((p) => {
      const hay = `${p.title} ${p.sku} ${p.category} ${(p.compatibility || []).join(' ')}`.toLowerCase();
      if (terms.some((t) => !hay.includes(t))) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (brands.length && !brandsOf(p).some((b) => brands.includes(b))) return false;
      if (inStock && !(p.stock > 0)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });
    const disc = (p) => (p.compareAt ? (p.compareAt - p.price) / p.compareAt : 0);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'discount') list = [...list].sort((a, b) => disc(b) - disc(a));
    // Out-of-stock items always after purchasable ones.
    return [...list].sort((a, b) => (a.stock > 0 ? 0 : 1) - (b.stock > 0 ? 0 : 1));
  }, [parts, q, cats, brands, brandsOf, inStock, maxPrice, sort]);

  const toggle = (setter) => (val) => setter((cur) => (cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]));
  const clear = () => {
    setCats([]);
    setBrands([]);
    setInStock(false);
    setMaxPrice('');
  };
  const active = cats.length + brands.length + (inStock ? 1 : 0) + (maxPrice ? 1 : 0);

  return (
    <>
      <div className="search-bar" style={{ margin: '8px 0 16px' }}>
        <SearchIcon />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by part name, bike model or SKU" aria-label="Search spare parts" type="search" />
      </div>

      <nav className="tabs" aria-label="Part categories">
        <button className="chip" aria-pressed={cats.length === 0} onClick={() => setCats([])}>All parts</button>
        {catOptions.map(([c, n]) => (
          <button key={c} className="chip" aria-pressed={cats.includes(c)} onClick={() => setCats(cats.includes(c) && cats.length === 1 ? [] : [c])}>
            {c} <small>{n}</small>
          </button>
        ))}
      </nav>

      <div className="parts-layout" style={{ marginTop: 12 }}>
        {open && <div className="filters-backdrop" onClick={() => setOpen(false)} />}
        <aside className={`filters ${open ? 'open' : ''}`} aria-label="Filters">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Filter</h3>
            {active > 0 && <button className="link-btn" onClick={clear}>Clear all</button>}
          </div>
          <div className="filter-group">
            <h4>Fits my vehicle</h4>
            <div className="opts">
              {brandOptions.map(([b, n]) => (
                <button key={b} className="chip" aria-pressed={brands.includes(b)} onClick={() => toggle(setBrands)(b)}>
                  {findBrand(brandMaster, b) && <BrandLogo brand={findBrand(brandMaster, b)} size={18} className="chip-logo" />}
                  {b} <small>{n}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>Category</h4>
            <div className="opts">
              {catOptions.map(([c, n]) => (
                <button key={c} className="chip" aria-pressed={cats.includes(c)} onClick={() => toggle(setCats)(c)}>{c} <small>{n}</small></button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>Price</h4>
            <div className="opts">
              {[1000, 2500, 5000].map((m) => (
                <button key={m} className="chip" aria-pressed={maxPrice === String(m)} onClick={() => setMaxPrice(maxPrice === String(m) ? '' : String(m))}>Under ₹{m.toLocaleString('en-IN')}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label className="check" style={{ color: 'var(--ink)', fontWeight: 700 }}>
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only
            </label>
          </div>
          {open && (
            <div className="filter-apply">
              <button className="btn block" onClick={clear}>Clear</button>
              <button className="btn dark block" onClick={() => setOpen(false)}>Show {filtered.length} parts</button>
            </div>
          )}
        </aside>

        <div>
          <div className="toolbar" style={{ marginTop: 0 }}>
            <span className="muted" style={{ fontSize: 14 }}><b style={{ color: 'var(--ink)' }}>{filtered.length}</b> parts</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="chip filter-toggle" onClick={() => setOpen(true)}>
                <FilterIcon width={16} height={16} /> Filter{active ? ` (${active})` : ''}
              </button>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
                {Object.entries(SORTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
          {filtered.length ? (
            <div className="pgrid">{filtered.map((p) => <PartCard key={p.id} p={p} />)}</div>
          ) : (
            <div className="empty">
              <h3>No parts found</h3>
              <p>Can’t find the part you need? Send us a photo on WhatsApp and we’ll source it.</p>
              <button className="btn" onClick={() => { setQ(''); clear(); }}>Reset search</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function countBy(list, keysFn) {
  const counts = {};
  list.forEach((p) => keysFn(p).forEach((k) => k && (counts[k] = (counts[k] || 0) + 1)));
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
}
