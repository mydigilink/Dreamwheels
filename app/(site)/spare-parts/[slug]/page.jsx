import Link from 'next/link';
import { notFound } from 'next/navigation';
import MediaViewer from '@/components/media/MediaViewer';
import BuyBox, { PincodeCheck } from '@/components/parts/BuyBox';
import PartCard, { PriceRow, StockLabel } from '@/components/parts/PartCard';
import EnquiryForm from '@/components/forms/EnquiryForm';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CashIcon, ReturnIcon, ShieldIcon, TruckIcon } from '@/components/Icons';
import SaveButton from '@/components/account/SaveButton';
import { getPart, getParts, getSettings } from '@/lib/db';
import { absUrl, discountPct, formatINR, MODULES, partUrl } from '@/lib/site';
import { partMessage } from '@/lib/whatsapp';
import { markdownToHtml, plainText } from '@/lib/markdown';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getPart(slug);
  if (!p) return {};
  const description = p.short || plainText(p.description);
  return {
    title: p.title,
    description,
    alternates: { canonical: partUrl(p) },
    openGraph: { type: 'website', title: p.title, description, url: partUrl(p), images: p.images?.length ? [{ url: p.images[0], alt: p.title }] : undefined },
    twitter: { card: 'summary_large_image', title: p.title, description, images: p.images?.slice(0, 1) },
  };
}

export default async function PartPage({ params }) {
  const { slug } = await params;
  const [p, settings, all] = await Promise.all([getPart(slug), getSettings(), getParts()]);
  if (!p) notFound();

  const url = absUrl(partUrl(p));
  const lead = { module: MODULES.parts, itemName: p.title, itemId: p.id, category: p.category, pageUrl: url };
  const message = partMessage({ name: p.title, sku: p.sku, url });
  const canBuy = p.mode === 'checkout' && p.stock > 0 && p.price > 0;
  const pct = discountPct(p.price, p.compareAt);
  const related = all
    .filter((x) => x.id !== p.id && (x.category === p.category || x.compatibility?.some((c) => p.compatibility?.includes(c))))
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    sku: p.sku,
    image: p.images,
    description: p.short,
    brand: { '@type': 'Brand', name: p.brand },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: p.price,
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    },
  };

  return (
    <div className={`wrap ${canBuy ? 'has-sticky' : ''}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span><Link href="/spare-parts/">Spare Parts</Link></span>
        <span><Link href={`/spare-parts/?cat=${encodeURIComponent(p.category)}`}>{p.category}</Link></span>
        <span>{p.title}</span>
      </nav>

      <div className="pdp-grid">
        <div>
          <MediaViewer images={p.images} title={p.title} />
        </div>

        <div className="pdp-info">
          <span className="vendor">{p.brand} · {p.category}</span>
          <h1>{p.title}</h1>
          <PriceRow price={p.price} compareAt={p.compareAt} />
          <p className="tax-note">
            {pct > 0 && <b className="out-stock">You save {formatINR(p.compareAt - p.price)}. </b>}
            Inclusive of all taxes. Shipping calculated at checkout.
          </p>
          <div className="sku-line">
            <span>SKU: <b>{p.sku}</b></span>
            {p.mode === 'checkout' ? <StockLabel stock={p.stock} /> : <span className="low-stock">● Available on enquiry</span>}
          </div>

          {p.short && <p>{p.short}</p>}

          {p.compatibility?.length > 0 && (
            <div style={{ margin: '16px 0' }}>
              <div className="field"><span className="label">Compatible with</span></div>
              <div className="compat" style={{ marginTop: 8 }}>
                {p.compatibility.map((c) => <span key={c}>✓ {c}</span>)}
              </div>
            </div>
          )}

          {canBuy ? (
            <BuyBox part={p} />
          ) : (
            <div className="notice" style={{ marginBottom: 10 }}>
              {p.mode === 'enquiry' ? 'This part is sold on enquiry — send us a message and we’ll confirm price, fitment and shipping.' : 'Currently out of stock. Enquire and we’ll notify you as soon as it’s back.'}
            </div>
          )}

          <WhatsAppButton number={settings.whatsapp} message={message} lead={lead} className="btn wa block" style={{ marginTop: 10 }}>
            Ask on WhatsApp
          </WhatsAppButton>
          <div style={{ marginTop: 10 }}><SaveButton type="part" id={p.id} title={p.title} variant="button" /></div>

          <div className="trust">
            <div><span><TruckIcon /></span>Free shipping over {formatINR(settings.freeShippingAbove)}</div>
            <div><span><CashIcon /></span>{settings.codEnabled ? 'Cash on delivery' : 'Secure payment'}</div>
            <div><span><ReturnIcon /></span>7-day easy returns</div>
            <div><span><ShieldIcon /></span>Quality checked</div>
          </div>

          <PincodeCheck codEnabled={settings.codEnabled} />

          <div className="accordion" style={{ marginTop: 16 }}>
            <details open>
              <summary>Description</summary>
              <div className="content prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(p.description) }} />
            </details>
            {p.specs?.length > 0 && (
              <details>
                <summary>Specifications</summary>
                <div className="content">
                  <table className="spec-table"><tbody>{p.specs.map((s) => <tr key={s.k}><th>{s.k}</th><td>{s.v}</td></tr>)}</tbody></table>
                </div>
              </details>
            )}
            <details>
              <summary>Shipping & returns</summary>
              <div className="content muted">
                Orders are dispatched within 1–2 working days. Free shipping on orders above {formatINR(settings.freeShippingAbove)}, otherwise {formatINR(settings.shippingFee)}.
                Unused parts in original packaging can be returned within 7 days of delivery.
              </div>
            </details>
          </div>

          {!canBuy && (
            <div className="panel" id="enquire" style={{ marginTop: 20, scrollMarginTop: 100 }}>
              <EnquiryForm context={lead} title="Enquire about this part" />
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="section tight">
          <div className="head">
            <div>
              <h2>Related parts</h2>
            </div>
          </div>
          <div className="pgrid">{related.map((x) => <PartCard key={x.id} p={x} />)}</div>
        </section>
      )}

      {!canBuy && (
        <div className="sticky-cta">
          <a href="#enquire" className="btn dark">Enquire</a>
          <WhatsAppButton number={settings.whatsapp} message={message} lead={lead} className="btn wa">WhatsApp</WhatsAppButton>
        </div>
      )}
    </div>
  );
}
