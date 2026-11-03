import Link from 'next/link';
import VehicleExplorer from './VehicleExplorer';
import VehicleCard from './VehicleCard';
import { absUrl } from '@/lib/site';

/** Shared view for category pages (/vintage-cars/) and sub-category pages (/vintage-cars/fiat/). */
export default function CategoryListing({ category, sub, categories, vehicles, others = [], settings }) {
  const catNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const h1 = sub ? `${sub.name} ${category.name}` : category.h1 || category.name;
  const intro = sub ? sub.intro : category.intro;
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: category.name, url: `/${category.slug}/` },
    ...(sub ? [{ name: sub.name, url: `/${category.slug}/${sub.slug}/` }] : []),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absUrl(c.url) })),
  };

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) =>
          i === crumbs.length - 1 ? <span key={c.url}>{c.name}</span> : i === 0 ? <Link key={c.url} href={c.url}>{c.name}</Link> : <span key={c.url}><Link href={c.url}>{c.name}</Link></span>
        )}
      </nav>

      <header className="page-hero">
        <span className="kicker">{category.kicker}</span>
        <h1>{h1}</h1>
        {intro && <p className="intro">{intro}</p>}
      </header>

      {/* Primary categories as tabs — every category within one click of the landing page */}
      <nav className="tabs" aria-label="Vehicle categories">
        {categories.map((c) => (
          <Link key={c.slug} href={`/${c.slug}/`} className={`chip ${c.slug === category.slug ? 'active' : ''}`}>
            {c.name}
          </Link>
        ))}
      </nav>

      {category.subcategories?.length > 0 && (
        <nav className="tabs" aria-label={`${category.name} collections`} style={{ marginTop: 4 }}>
          <Link href={`/${category.slug}/`} className="chip" aria-pressed={!sub}>All {category.name}</Link>
          {category.subcategories.map((s) => (
            <Link key={s.slug} href={`/${category.slug}/${s.slug}/`} className="chip" aria-pressed={sub?.slug === s.slug}>
              {s.name}
            </Link>
          ))}
        </nav>
      )}

      <section style={{ padding: '8px 0 40px' }}>
        <VehicleExplorer items={vehicles} catNames={catNames} whatsapp={settings.whatsapp} />
      </section>

      {others.length > 0 && (
        <section className="section tight">
          <div className="head">
            <div>
              <h2>Other categories</h2>
            </div>
          </div>
          <div className="grid">
            {others.map((v) => <VehicleCard key={v.id} v={v} categoryName={catNames[v.category]} whatsapp={settings.whatsapp} />)}
          </div>
        </section>
      )}
    </div>
  );
}
