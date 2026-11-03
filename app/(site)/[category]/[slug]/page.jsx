import Link from 'next/link';
import { notFound } from 'next/navigation';
import CategoryListing from '@/components/CategoryListing';
import VehicleCard, { vehicleLead } from '@/components/VehicleCard';
import MediaViewer from '@/components/media/MediaViewer';
import EnquiryForm from '@/components/forms/EnquiryForm';
import WhatsAppButton from '@/components/WhatsAppButton';
import SaveButton from '@/components/account/SaveButton';
import BrandLogo from '@/components/BrandLogo';
import { getBrands, getCategories, getSettings, getVehicle, getVehicles } from '@/lib/db';
import { brandUrl, findBrand } from '@/lib/brands';
import { absUrl, formatINR, vehicleUrl } from '@/lib/site';
import { markdownToHtml, plainText } from '@/lib/markdown';

// One dynamic segment serves both sub-category pages (/vintage-bikes/royal-enfield/)
// and single vehicle pages (/vintage-bikes/royal-enfield-bullet-350-1972/).
async function resolve(params) {
  const { category: catSlug, slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === catSlug);
  if (!category) return null;
  const sub = category.subcategories?.find((s) => s.slug === slug);
  if (sub) return { kind: 'sub', category, categories, sub };
  const vehicle = await getVehicle(catSlug, slug);
  if (vehicle) return { kind: 'vehicle', category, categories, vehicle };
  return null;
}

export async function generateMetadata({ params }) {
  const r = await resolve(params);
  if (!r) return {};
  if (r.kind === 'sub') {
    const url = `/${r.category.slug}/${r.sub.slug}/`;
    return { title: `${r.sub.name} ${r.category.name} for Sale`, description: r.sub.intro, alternates: { canonical: url } };
  }
  const v = r.vehicle;
  const url = vehicleUrl(v);
  const title = v.seoTitle || `${v.title} for Sale`;
  const description = v.seoDescription || v.summary || plainText(v.description);
  // Vehicle-specific OG image is mandatory (spec §2.11.4) — no generic fallback.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: v.title,
      description,
      url,
      siteName: 'DreamWheels',
      images: v.images?.length ? [{ url: v.images[0], width: 1200, height: 900, alt: v.title }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: v.title, description, images: v.images?.slice(0, 1) },
  };
}

export default async function SlugPage({ params }) {
  const r = await resolve(params);
  if (!r) notFound();
  const settings = await getSettings();

  if (r.kind === 'sub') {
    const vehicles = await getVehicles({ category: r.category.slug, sub: r.sub.slug });
    return <CategoryListing category={r.category} sub={r.sub} categories={r.categories} vehicles={vehicles} settings={settings} />;
  }

  const { vehicle: v, category, categories } = r;
  const catNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const wa = vehicleLead(v, category.name);
  const sold = v.availability === 'Sold';
  const related = (await getVehicles({ category: category.slug })).filter((x) => x.id !== v.id && x.availability !== 'Sold').slice(0, 3);
  const subs = (category.subcategories || []).filter((s) => v.subcategories?.includes(s.slug));
  const brand = findBrand(await getBrands(), v.brand);

  const specs = [
    ['Brand', brand ? <Link href={brandUrl(brand)} className="text-link">{brand.name}</Link> : v.brand],
    ['Model', v.model],
    ['Year', v.year],
    ['Condition', v.condition],
    ['Engine', v.engine],
    ['Odometer', v.mileage],
    ['Colour', v.color],
    ['Registration', v.registration],
    ['Location', v.location],
    ['Availability', v.availability],
  ].filter(([, val]) => val);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: v.title,
    image: v.images,
    description: v.summary,
    brand: { '@type': 'Brand', name: v.brand, ...(brand?.logo ? { logo: absUrl(brand.logo) } : {}) },
    category: category.name,
    ...(v.price
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: v.price,
            availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
            url: wa.url,
          },
        }
      : {}),
  };

  const videoFallback = (
    <div className="video-pending">
      <div>
        <p style={{ fontSize: 28, margin: 0 }}>▶</p>
        <p>A walkthrough video for this {category.label?.toLowerCase() || 'vehicle'} is available on request.</p>
        <WhatsAppButton number={settings.whatsapp} message={`${wa.message}\n\nPlease send me a walkthrough video.`} lead={wa.lead} className="btn wa sm">
          Request video on WhatsApp
        </WhatsAppButton>
      </div>
    </div>
  );

  return (
    <div className="wrap has-sticky">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span><Link href={`/${category.slug}/`}>{category.name}</Link></span>
        <span>{v.title}</span>
      </nav>

      <div className="detail-grid">
        <div>
          <MediaViewer images={v.images} video={v.video} spin={v.spin360} title={v.title} videoFallback={videoFallback} />

          <div className="panel" style={{ marginTop: 20 }}>
            <h2>Specifications</h2>
            <table className="spec-table">
              <tbody>
                {specs.map(([k, val]) => (
                  <tr key={k}><th>{k}</th><td>{val}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2>About this {category.label?.toLowerCase() || 'vehicle'}</h2>
            <div className="prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(v.description) }} />
            {subs.length > 0 && (
              <div className="subnav" style={{ marginTop: 16 }}>
                {subs.map((s) => <Link key={s.slug} className="chip" href={`/${category.slug}/${s.slug}/`}>{s.name}</Link>)}
              </div>
            )}
          </div>
        </div>

        <aside className="info">
          <span className="kicker">{category.name} · {v.year}</span>
          <h1>{v.title}</h1>
          {brand && (
            <Link href={brandUrl(brand)} className="brand-chip">
              <BrandLogo brand={brand} size={28} />
              <span>More from <b>{brand.name}</b></span>
            </Link>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {v.condition && <span className="badge" style={{ background: 'var(--sand)' }}>{v.condition}</span>}
            <span className={`badge ${sold ? 'sold' : v.availability === 'Reserved' ? 'reserved' : 'ok'}`}>{v.availability}</span>
          </div>
          <div className="price-big">{sold ? 'Sold' : formatINR(v.price)}</div>
          {v.summary && <p className="muted">{v.summary}</p>}

          <div className="quick-specs">
            <div><small>Year</small><b>{v.year}</b></div>
            <div><small>Engine</small><b>{v.engine || '—'}</b></div>
            <div><small>Condition</small><b>{v.condition || '—'}</b></div>
            <div><small>Odometer</small><b>{v.mileage || '—'}</b></div>
          </div>

          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            <WhatsAppButton number={settings.whatsapp} message={wa.message} lead={wa.lead} className="btn wa block">
              {sold ? 'Ask about similar vehicles' : 'Chat on WhatsApp'}
            </WhatsAppButton>
            <a href="#enquire" className="btn dark block">Send an enquiry</a>
            <SaveButton type="vehicle" id={v.id} title={v.title} variant="button" />
          </div>

          <div className="panel" id="enquire" style={{ scrollMarginTop: 100 }}>
            <EnquiryForm
              context={wa.lead}
              title={sold ? 'Looking for one like this?' : 'Enquire about this vehicle'}
              defaultMessage={sold ? 'This one is sold — please let me know if you find something similar.' : ''}
            />
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section tight">
          <div className="head">
            <div>
              <h2>More {category.name.toLowerCase()}</h2>
            </div>
            <Link href={`/${category.slug}/`} className="btn">View all</Link>
          </div>
          <div className="grid">
            {related.map((x) => <VehicleCard key={x.id} v={x} categoryName={catNames[x.category]} whatsapp={settings.whatsapp} />)}
          </div>
        </section>
      )}

      {/* Sticky mobile CTAs (spec §2.6 / §2.10.7) */}
      <div className="sticky-cta">
        <a href="#enquire" className="btn dark">Enquire</a>
        <WhatsAppButton number={settings.whatsapp} message={wa.message} lead={wa.lead} className="btn wa">WhatsApp</WhatsAppButton>
      </div>
    </div>
  );
}
