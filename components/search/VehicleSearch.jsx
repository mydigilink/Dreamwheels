'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SearchIcon } from '../Icons';

export const YEAR_OPTIONS = [
  ['pre-1960', 'Pre-1960'],
  ['1960s', '1960s'],
  ['1970s', '1970s'],
  ['1980s', '1980s'],
  ['1990s', '1990s'],
  ['2000s', '2000 & newer'],
];

/** Search · Category · Location · Year finder. Horizontal on desktop, stacked on mobile. */
export default function VehicleSearch({ categories, locations, initial = {}, onDone, autoFocus = false }) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q || '');
  const [category, setCategory] = useState(initial.category || '');
  const [location, setLocation] = useState(initial.location || '');
  const [year, setYear] = useState(initial.year || '');

  function submit(e) {
    e.preventDefault();
    onDone?.();
    if (category === 'spare-parts') {
      router.push(q ? `/spare-parts/?q=${encodeURIComponent(q)}` : '/spare-parts/');
      return;
    }
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (category) p.set('category', category);
    if (location) p.set('location', location);
    if (year) p.set('year', year);
    router.push(`/search/${p.toString() ? `?${p}` : ''}`);
  }

  return (
    <form className="finder" onSubmit={submit} role="search">
      <label className="f-field f-q">
        <span>Search</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Royal Enfield, Jawa, Lambretta…" autoFocus={autoFocus} type="search" />
      </label>
      <label className="f-field">
        <span>Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Vehicles</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          <option value="spare-parts">Spare Parts</option>
        </select>
      </label>
      <label className="f-field">
        <span>Location</span>
        <select value={location} onChange={(e) => setLocation(e.target.value)} disabled={category === 'spare-parts'}>
          <option value="">All India</option>
          {locations.map((l) => <option key={l}>{l}</option>)}
        </select>
      </label>
      <label className="f-field">
        <span>Year</span>
        <select value={year} onChange={(e) => setYear(e.target.value)} disabled={category === 'spare-parts'}>
          <option value="">Any Year</option>
          {YEAR_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <button className="finder-btn" type="submit">
        <SearchIcon /> Search
      </button>
    </form>
  );
}
