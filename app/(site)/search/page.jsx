import Link from 'next/link';
import VehicleSearch from '@/components/search/VehicleSearch';
import VehicleExplorer from '@/components/VehicleExplorer';
import PartCard from '@/components/parts/PartCard';
import { getCategories, getLocations, getParts, getSettings, getVehicles } from '@/lib/db';

// Search result pages are thin/duplicate by nature — keep them out of the index.
export const metadata = { title: 'Search', robots: { index: false, follow: true } };

const str = (v) => (typeof v === 'string' ? v : '');

function matchYear(y, key) {
  if (!key) return true;
  if (!y) return false;
  if (key === 'pre-1960') return y < 1960;
  if (key === '2000s') return y >= 2000;
  const start = Number(key.slice(0, 4));
  return y >= start && y < start + 10;
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = str(sp.q).trim();
  const category = str(sp.category);
  const location = str(sp.location);
  const year = str(sp.year);

  const [settings, categories, locations, vehicles, parts] = await Promise.all([getSettings(), getCategories(), getLocations(), getVehicles(), getParts()]);
  const catNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

  const results = vehicles.filter((v) => {
    if (category && v.category !== category) return false;
    if (location && v.location !== location) return false;
    if (!matchYear(v.year, year)) return false;
    const hay = `${v.title} ${v.brand} ${v.model} ${v.year} ${v.location} ${v.condition} ${catNames[v.category]}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });

  const partResults = terms.length && !category
    ? parts.filter((p) => terms.every((t) => `${p.title} ${p.sku} ${(p.compatibility || []).join(' ')}`.toLowerCase().includes(t))).slice(0, 4)
    : [];

  const summary = [q && `“${q}”`, category && catNames[category], location, year].filter(Boolean).join(' · ');

  return (
    <div className="wrap" style={{ paddingBottom: 48 }}>
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>Search</span></nav>
      <header className="page-hero">
        <span className="kicker">Search</span>
        <h1>{summary ? `Results for ${summary}` : 'All vehicles'}</h1>
      </header>

      <div style={{ margin: '8px 0 24px' }}>
        <VehicleSearch key={`${q}|${category}|${location}|${year}`} categories={categories} locations={locations} initial={{ q, category, location, year }} />
      </div>

      {results.length > 0 ? (
        <VehicleExplorer items={results} catNames={catNames} whatsapp={settings.whatsapp} />
      ) : (
        <div className="empty">
          <h3>No vehicles match your search</h3>
          <p>Try a broader search, or tell us what you are looking for and we’ll help you find it.</p>
          <Link href="/vintage-bikes/" className="btn dark">Browse all vehicles</Link>
        </div>
      )}

      {partResults.length > 0 && (
        <section className="section tight">
          <div className="head">
            <div>
              <h2>Matching parts</h2>
            </div>
            <Link href={`/spare-parts/?q=${encodeURIComponent(q)}`} className="btn">All matching parts</Link>
          </div>
          <div className="pgrid">{partResults.map((p) => <PartCard key={p.id} p={p} />)}</div>
        </section>
      )}
    </div>
  );
}
