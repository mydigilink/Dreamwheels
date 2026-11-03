import Link from 'next/link';
import Img from '@/components/Img';
import RestorationForm from '@/components/forms/RestorationForm';
import { BoltIcon, BrushIcon, EngineIcon, SeatIcon } from '@/components/Icons';
import { getBrands, getSettings } from '@/lib/db';
import { absUrl } from '@/lib/site';

const OG = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80';

export const metadata = {
  title: 'Vintage Bike & Car Restoration Services',
  description: 'Professional restoration for vintage motorcycles, scooters and classic cars — engine rebuilds, paint and chrome, wiring and period-correct parts. Share photos to request an assessment.',
  alternates: { canonical: '/restoration/' },
  // Restoration-specific OG image (spec §5.8) — not the generic site image.
  openGraph: { title: 'Restoration Services — DreamWheels', url: '/restoration/', images: [{ url: OG, alt: 'DreamWheels restoration workshop' }] },
};

const SERVICES = [
  [EngineIcon, 'Engine & gearbox rebuilds', 'Bored, honed and rebuilt to factory tolerances.'],
  [BrushIcon, 'Paint, chrome & pinstriping', 'Period-correct colours and hand-laid pinstripes.'],
  [BoltIcon, 'Electrical & wiring', 'New looms, 6V to 12V conversions, reliable charging.'],
  [SeatIcon, 'Upholstery & trims', 'Seats, rubbers, badges and the small details.'],
];

export default async function RestorationPage() {
  const [settings, brands] = await Promise.all([getSettings(), getBrands()]);
  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>Restoration</span></nav>

      <div className="split" style={{ padding: '20px 0 40px' }}>
        <div className="sticky">
          <span className="kicker">Restoration services</span>
          <h1 style={{ margin: '8px 0 16px' }}>Vintage bike, scooter and car restoration</h1>
          <p className="muted" style={{ fontSize: 16 }}>
            From a tired barn-find to a concours-ready classic: send us photos of your vintage bike, scooter or car and our workshop will assess what it
            needs. Every project starts with an inspection and a clear plan.
          </p>
          <div className="ba" style={{ margin: '20px 0' }}>
            <figure className="before">
              <Img src="https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=700&q=70" alt="Before restoration" />
              <figcaption><span className="badge">Before</span></figcaption>
            </figure>
            <figure>
              <Img src="https://images.unsplash.com/photo-1525013066836-c6090f0ad9d8?auto=format&fit=crop&w=700&q=70" alt="After restoration" />
              <figcaption><span className="badge gold">After</span></figcaption>
            </figure>
          </div>
          <div className="service-list">
            {SERVICES.map(([Icon, t, d]) => (
              <div key={t}><span className="svc-ico"><Icon /></span><div><b>{t}</b><span>{d}</span></div></div>
            ))}
          </div>
        </div>
        <div className="panel" id="request">
          <RestorationForm whatsapp={settings.whatsapp} pageUrl={absUrl('/restoration/')} maxImages={settings.maxUploadImages} maxMb={settings.maxUploadMb} brands={brands.map(({ name, types }) => ({ name, types }))} />
        </div>
      </div>

      <section className="section tight">
        <div className="feature">
          <Img src={OG} alt="Workshop" />
          <div className="copy">
            <span className="kicker">How it works</span>
            <h2>From first photos to finished vehicle</h2>
            <div className="steps">
              <div><small>1</small><b>Share photos</b></div>
              <div><small>2</small><b>Inspection & quote</b></div>
              <div><small>3</small><b>Restoration begins</b></div>
            </div>
            <p>Restoration is a service, not a sale: if you are looking to buy a restored classic instead, browse our <Link href="/vintage-bikes/" style={{ textDecoration: 'underline' }}>vintage marketplace</Link>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
