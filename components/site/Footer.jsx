import Link from 'next/link';
import { ChatIcon, ClipboardIcon, MailIcon, TruckIcon, WhatsAppIcon, WrenchIcon } from '../Icons';
import { formatINR } from '@/lib/site';

const ico = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const PhoneIcon = () => <svg {...ico}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>;
const PinIcon = () => <svg {...ico}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;

export default function Footer({ settings, categories }) {
  const tel = settings.phone.replace(/\s/g, '');
  const promises = [
    [ClipboardIcon, 'Inspected & documented', 'Every vehicle checked before listing'],
    [TruckIcon, 'Genuine spare parts', `Free shipping over ${formatINR(settings.freeShippingAbove)}`],
    [WrenchIcon, 'Workshop restoration', 'Engine, paint, wiring and trim'],
    [ChatIcon, 'Talk to our team', 'Call or WhatsApp during working hours'],
  ];

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-cta">
          <div>
            <h2>Have a classic to sell or restore?</h2>
            <p>List it on DreamWheels or get a restoration quote from our workshop.</p>
          </div>
          <div className="foot-cta-btns">
            <Link href="/sell-your-bike/" className="btn gold">Sell your vehicle</Link>
            <Link href="/restoration/" className="btn ghost-light">Get a restoration quote</Link>
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener" className="btn wa" aria-label="Chat on WhatsApp">
              <WhatsAppIcon /> <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <ul className="foot-promises">
          {promises.map(([Icon, t, d]) => (
            <li key={t}><span className="pi"><Icon /></span><div><b>{t}</b><small>{d}</small></div></li>
          ))}
        </ul>

        <div className="foot-grid">
          <div className="foot-about">
            <p className="foot-brand">DreamWheels</p>
            <p>Classic and vintage bikes, scooters and cars for sale — with genuine spare parts and workshop restoration.</p>
            <ul className="foot-contact">
              <li><a href={`tel:${tel}`}><span><PhoneIcon /></span>{settings.phone}</a></li>
              <li><a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener"><span className="wa"><WhatsAppIcon width={16} height={16} /></span>Chat on WhatsApp</a></li>
              <li><a href={`mailto:${settings.email}`}><span><MailIcon width={16} height={16} /></span>{settings.email}</a></li>
              <li><span><PinIcon /></span>{settings.address}</li>
            </ul>
          </div>
          <nav aria-label="Marketplace">
            <h4>Marketplace</h4>
            <ul>
              {categories.map((c) => <li key={c.slug}><Link href={`/${c.slug}/`}>{c.name}</Link></li>)}
              <li><Link href="/brands/">Shop by brand</Link></li>
              <li><Link href="/search/">Search all vehicles</Link></li>
            </ul>
          </nav>
          <nav aria-label="Services">
            <h4>Services</h4>
            <ul>
              <li><Link href="/spare-parts/">Spare Parts</Link></li>
              <li><Link href="/restoration/">Restoration</Link></li>
              <li><Link href="/sell-your-bike/">Sell Your Bike / Car</Link></li>
              <li><Link href="/blog/">Blog & Guides</Link></li>
            </ul>
          </nav>
          <nav aria-label="Help">
            <h4>Help</h4>
            <ul>
              <li><Link href="/contact/">Contact us</Link></li>
              <li><Link href="/cart/">Your cart</Link></li>
              <li><Link href="/spare-parts/">Shipping & returns</Link></li>
              {settings.codEnabled && <li><span className="foot-badge">Cash on delivery available</span></li>}
            </ul>
          </nav>
        </div>

        <div className="bottom">
          <span>© {new Date().getFullYear()} DreamWheels. All rights reserved.</span>
          <span className="bottom-links">
            <Link href="/sitemap.xml">Sitemap</Link>
            <Link href="/contact/">Contact</Link>
            <a href="#" className="to-top">Back to top</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
