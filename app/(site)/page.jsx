import Link from 'next/link';
import Img from '@/components/Img';
import VehicleCard from '@/components/VehicleCard';
import PartCard from '@/components/parts/PartCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import VehicleSearch from '@/components/search/VehicleSearch';
import { BodyIcon, BoltIcon, EngineIcon, WheelIcon, WhatsAppIcon } from '@/components/Icons';
import BrandStrip from '@/components/BrandStrip';
import { getBrands, getCategories, getParts, getPosts, getSettings, getVehicles } from '@/lib/db';
import { absUrl, formatDate, postUrl } from '@/lib/site';
import { generalMessage } from '@/lib/whatsapp';

export const metadata = {
  title: { absolute: 'DreamWheels — Vintage Bikes, Vintage Scooters, Vintage Cars & Super Bikes for Sale' },
  alternates: { canonical: '/' },
};

const PART_TILES = [
  { Icon: EngineIcon, name: 'Engine & Clutch' },
  { Icon: WheelIcon, name: 'Wheels & Brakes' },
  { Icon: BodyIcon, name: 'Body Panels' },
  { Icon: BoltIcon, name: 'Electrical' },
];

const plural = (n, one, many = `${one}s`) => (n === 1 ? one : many);
const listingCount = (n) => `${n} ${plural(n, 'listing')}`;

export default async function Home() {
  const [settings, categories, all, featured, parts, posts, brands] = await Promise.all([
    getSettings(),
    getCategories(),
    getVehicles(),
    getVehicles({ featured: true, limit: 6 }),
    getParts({ limit: 4 }),
    getPosts({ limit: 3 }),
    getBrands({ featured: true }),
  ]);
  const brandCounts = {};
  for (const v of all) brandCounts[(v.brand || '').trim().toLowerCase()] = (brandCounts[(v.brand || '').trim().toLowerCase()] || 0) + 1;
  const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const hero = featured[0];
  const brandTotal = new Set(all.map((v) => v.brand)).size;

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="kicker">Classic vehicle marketplace</span>
              <h1>Vintage bikes, scooters and classic cars for sale</h1>
              <p className="lead">
                Browse classic motorcycles, scooters and collector cars, shop vintage spare parts, or bring your vehicle to our restoration workshop.
              </p>
              <div className="hero-ctas">
                <Link className="btn dark" href="/vintage-bikes/">Browse vehicles</Link>
                <Link className="btn" href="/sell-your-bike/">Sell your vehicle</Link>
              </div>
              <div className="stats">
                <div className="stat"><b>{all.length}</b><span>{plural(all.length, 'Vehicle')} listed</span></div>
                <div className="stat"><b>{brandTotal}</b><span>{plural(brandTotal, 'Brand')}</span></div>
                <div className="stat"><b>{categories.length}</b><span>{plural(categories.length, 'Category', 'Categories')}</span></div>
              </div>
            </div>
            <Link href={hero ? `/${hero.category}/${hero.slug}/` : '/vintage-bikes/'} className="hero-media">
              <Img src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=85" alt="Featured vintage motorcycle" eager />
              <div className="hero-note">
                <div>
                  <small>Featured</small>
                  <strong>{hero ? hero.title : 'Collector motorcycles'}</strong>
                </div>
                <span>View details</span>
              </div>
            </Link>
          </div>
          <div className="hero-finder">
            <VehicleSearch categories={categories} locations={[...new Set(all.map((v) => v.location).filter(Boolean))].sort()} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="head">
            <h2>Shop by category</h2>
            <p>Vintage bikes, vintage scooters, vintage cars and super bikes for sale.</p>
          </div>
          <div className="categories">
            {categories.map((c) => (
              <Link key={c.slug} className="cat" href={`/${c.slug}/`}>
                <Img src={c.image} alt={c.name} />
                <div className="txt">
                  {c.kicker && <small>{c.kicker}</small>}
                  <h3>{c.name}</h3>
                  <span className="count">{listingCount(all.filter((v) => v.category === c.slug).length)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="section tight">
          <div className="wrap">
            <div className="head">
              <h2>Shop by brand</h2>
              <Link className="btn" href="/brands/">All brands</Link>
            </div>
            <BrandStrip brands={brands} counts={brandCounts} />
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="section tight">
          <div className="wrap">
            <div className="head">
              <h2>Featured vehicles</h2>
              <Link className="btn" href="/vintage-bikes/">View all vehicles</Link>
            </div>
            <div className="grid">
              {featured.map((v) => (
                <VehicleCard key={v.id} v={v} categoryName={catName[v.category]} whatsapp={settings.whatsapp} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="feature">
            <Img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1300&q=80" alt="Restoration workshop" />
            <div className="copy">
              <span className="kicker">Restoration</span>
              <h2>Restoration and repair for classic vehicles</h2>
              <p>Engine rebuilds, paint and chrome, wiring and period-correct trims. Send us photos of your vehicle and our workshop will tell you what it needs and what it will cost.</p>
              <div className="steps">
                <div><small>1</small><b>Send photos</b></div>
                <div><small>2</small><b>Inspection & quote</b></div>
                <div><small>3</small><b>Restoration</b></div>
              </div>
              <Link className="btn" href="/restoration/">Request a quote</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section parts-band">
        <div className="wrap">
          <div className="head">
            <div>
              <h2>Spare parts</h2>
              <p style={{ marginTop: 8 }}>Royal Enfield · Jawa · Yezdi · BSA · Triumph · Lambretta</p>
            </div>
            <Link className="btn dark" href="/spare-parts/">Shop all parts</Link>
          </div>
          <div className="part-grid">
            <div className="big">
              <h3>Search by brand, model or part number</h3>
              <p className="muted">Can’t find a part? Ask us on WhatsApp and we’ll source it.</p>
              <form action="/spare-parts/" className="search-bar" style={{ marginTop: 18 }}>
                <input name="q" placeholder="e.g. Bullet wiring harness" aria-label="Search spare parts" />
                <button className="btn dark sm" type="submit">Search</button>
              </form>
              <Img src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80" alt="Vintage spare parts" />
            </div>
            <div className="mini-grid">
              {PART_TILES.map(({ Icon, name }) => (
                <Link key={name} className="mini" href={`/spare-parts/?cat=${encodeURIComponent(name)}`}>
                  <span className="ico"><Icon /></span>
                  <div>
                    <b>{name}</b>
                    <span>Shop {name.toLowerCase()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {parts.length > 0 && (
            <div className="pgrid" style={{ marginTop: 24 }}>
              {parts.map((p) => <PartCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="head">
              <h2>From the blog</h2>
              <Link className="btn" href="/blog/">All articles</Link>
            </div>
            <div className="post-grid">
              {posts.map((p) => (
                <Link key={p.id} href={postUrl(p)} className="post-card">
                  <Img src={p.cover} alt={p.title} />
                  <div className="body">
                    <span className="kicker">{formatDate(p.createdAt)}</span>
                    <h3>{p.title}</h3>
                    <p>{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section tight">
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Looking for a specific vehicle or part?</h2>
              <p>Tell us what you’re after and our team will help you find it.</p>
            </div>
            <WhatsAppButton
              number={settings.whatsapp}
              className="btn wa"
              message={generalMessage({ url: absUrl('/'), source: 'Home page' })}
              lead={{ module: 'Website', itemName: 'Specialist enquiry', category: '', pageUrl: absUrl('/') }}
            >
              <WhatsAppIcon /> Chat on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </section>
    </>
  );
}
