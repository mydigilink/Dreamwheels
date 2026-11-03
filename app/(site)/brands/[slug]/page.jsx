import Link from 'next/link';
import { notFound } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import BrandStrip from '@/components/BrandStrip';
import VehicleCard from '@/components/VehicleCard';
import PartCard from '@/components/parts/PartCard';
import { getBrand, getBrands, getCategories, getParts, getSettings, getVehicles } from '@/lib/db';
import { brandKey, brandUrl, partBrands } from '@/lib/brands';
import { markdownToHtml, plainText } from '@/lib/markdown';

const TYPE_WORDS = { Bike: 'bikes', Scooter: 'scooters', Car: 'cars' };
const typeWords = (b) => (b.types?.length ? b.types.map((t) => TYPE_WORDS[t]).join(' & ') : 'vehicles');

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = await getBrand(slug);
  if (!b) return {};
  const intro = plainText(b.description || '').slice(0, 155);
  return {
    title: `${b.name} — Vintage ${typeWords(b)} & spare parts for sale`,
    description: intro || `Classic ${b.name} ${typeWords(b)} for sale, genuine ${b.name} spare parts and restoration at DreamWheels.`,
    alternates: { canonical: brandUrl(b) },
    openGraph: b.logo ? { images: [{ url: b.logo, alt: `${b.name} logo` }] } : undefined,
  };
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();
  const [brands, vehicles, parts, categories, settings] = await Promise.all([getBrands(), getVehicles(), getParts(), getCategories(), getSettings()]);
  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const own = vehicles.filter((v) => brandKey(v.brand) === brandKey(brand.name));
  const fits = parts.filter((p) => partBrands(p, brands).includes(brand.name));
  const others = brands.filter((b) => b.id !== brand.id && b.types?.some((t) => brand.types?.includes(t))).slice(0, 6);
  const meta = [brand.country, brand.founded && `Founded ${brand.founded}`, brand.types?.join(' · ')].filter(Boolean);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span><Link href="/brands/">Brands</Link></span>
        <span>{brand.name}</span>
      </nav>

      <header className="brand-hero">
        <BrandLogo brand={brand} size={112} />
        <div style={{ minWidth: 0 }}>
          <h1>{brand.name}</h1>
          {meta.length > 0 && <p className="brand-meta">{meta.join(' · ')}</p>}
          <div className="brand-jump">
            <a href="#vehicles" className="chip">{own.length} {own.length === 1 ? 'vehicle' : 'vehicles'}</a>
            <a href="#parts" className="chip">{fits.length} spare {fits.length === 1 ? 'part' : 'parts'}</a>
          </div>
        </div>
      </header>

      {brand.description && <div className="panel prose brand-about" dangerouslySetInnerHTML={{ __html: markdownToHtml(brand.description) }} />}

      <section className="section tight" id="vehicles">
        <div className="head"><h2>{brand.name} vehicles for sale</h2></div>
        {own.length ? (
          <div className="grid">
            {own.map((v) => <VehicleCard key={v.id} v={v} categoryName={catName[v.category]} whatsapp={settings.whatsapp} />)}
          </div>
        ) : (
          <div className="empty">
            <h3>No {brand.name} vehicles listed right now</h3>
            <p>New stock arrives regularly. Tell us what you’re looking for and we’ll let you know.</p>
            <Link href="/contact/" className="btn dark">Ask us to find one</Link>
          </div>
        )}
      </section>

      <section className="section tight" id="parts">
        <div className="head">
          <h2>{brand.name} spare parts</h2>
          {fits.length > 0 && <Link href={`/spare-parts/?q=${encodeURIComponent(brand.name)}`} className="btn">Search all {brand.name} parts</Link>}
        </div>
        {fits.length ? (
          <div className="pgrid">{fits.slice(0, 8).map((p) => <PartCard key={p.id} p={p} />)}</div>
        ) : (
          <div className="empty">
            <h3>No {brand.name} parts listed yet</h3>
            <p>We source parts on request — send us the model and part you need.</p>
            <Link href="/spare-parts/" className="btn">Browse all parts</Link>
          </div>
        )}
      </section>

      <section className="section tight">
        <div className="cta">
          <div>
            <h2>Own a {brand.name}?</h2>
            <p>Sell it through DreamWheels or get a restoration quote from our workshop.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/sell-your-bike/" className="btn dark">Sell your vehicle</Link>
            <Link href="/restoration/" className="btn">Restoration quote</Link>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section tight">
          <div className="head"><h2>Other brands</h2><Link href="/brands/" className="btn">All brands</Link></div>
          <BrandStrip brands={others} />
        </section>
      )}
    </div>
  );
}
