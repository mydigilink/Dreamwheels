import Link from 'next/link';
import EnquiryForm from '@/components/forms/EnquiryForm';
import WhatsAppButton from '@/components/WhatsAppButton';
import { MailIcon, WhatsAppIcon } from '@/components/Icons';
import { getSettings } from '@/lib/db';
import { absUrl } from '@/lib/site';
import { generalMessage } from '@/lib/whatsapp';

export const metadata = {
  title: 'Contact DreamWheels',
  description: 'Talk to DreamWheels about buying a vintage bike, scooter or car, spare parts, restoration or selling your vehicle. Call, WhatsApp or send a message.',
  alternates: { canonical: '/contact/' },
};

const ico = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const PhoneIcon = () => <svg {...ico}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>;
const PinIcon = () => <svg {...ico}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
const ClockIcon = () => <svg {...ico}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;

const TOPICS = ['Buying a vehicle', 'Spare parts', 'Restoration', 'Selling my vehicle', 'Something else'];

const FAQ = [
  ['How do I buy a vehicle listed on the site?', 'Open the vehicle page and send an enquiry or tap WhatsApp — the vehicle name and link are attached automatically, so our team knows exactly which machine you mean.', '/vintage-bikes/', 'Browse vehicles'],
  ['Can I order spare parts online?', 'Yes. Most parts can be added to the cart and ordered with cash on delivery or pay-on-confirmation. Parts marked “enquire” are confirmed with you first.', '/spare-parts/', 'Shop spare parts'],
  ['How does restoration work?', 'Share photos and details of your vehicle through the restoration form. Our workshop reviews them and contacts you to discuss an inspection and plan.', '/restoration/', 'Request restoration'],
  ['I want to sell my bike or car.', 'Submit it through the Sell Your Vehicle form with photos. Every submission is reviewed by our team before anything is listed.', '/sell-your-bike/', 'Sell your vehicle'],
];

export default async function ContactPage() {
  const s = await getSettings();
  const url = absUrl('/contact/');
  const tel = s.phone.replace(/\s/g, '');
  const mapQuery = encodeURIComponent(s.address);
  const waLead = { module: 'Website', itemName: 'Contact page', category: '', pageUrl: url };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>Contact</span></nav>
          <span className="kicker">Contact</span>
          <h1>Contact DreamWheels</h1>
          <p>Questions about buying, selling, restoration or spare parts? Call us, send a WhatsApp message or use the form below.</p>
        </div>
      </section>

      <div className="wrap">
        <div className="contact-cards">
          <a href={`tel:${tel}`} className="contact-card">
            <span className="cc-ico"><PhoneIcon /></span>
            <small>Call us</small>
            <b>{s.phone}</b>
            <em>Tap to call</em>
          </a>
          <WhatsAppButton number={s.whatsapp} className="contact-card wa" message={generalMessage({ url, source: 'Contact page' })} lead={waLead} bare>
            <span className="cc-ico"><WhatsAppIcon width={22} height={22} /></span>
            <small>WhatsApp</small>
            <b>Chat with a specialist</b>
            <em>Open chat</em>
          </WhatsAppButton>
          <a href={`mailto:${s.email}`} className="contact-card">
            <span className="cc-ico"><MailIcon width={22} height={22} /></span>
            <small>Email</small>
            <b>{s.email}</b>
            <em>Write to us</em>
          </a>
          <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener" className="contact-card">
            <span className="cc-ico"><PinIcon /></span>
            <small>Visit</small>
            <b>{s.address}</b>
            <em>Get directions</em>
          </a>
        </div>

        <div className="contact-main">
          <div className="panel contact-form">
            <EnquiryForm
              title="Send us a message"
              subtitle="We usually reply within one working day."
              topics={TOPICS}
              context={{ module: 'Website', itemName: '', itemId: '', category: '', pageUrl: url }}
            />
          </div>

          <aside className="contact-side">
            <div className="contact-map">
              <iframe
                title={`Map: ${s.address}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="panel contact-info">
              <div className="ci-row"><span className="cc-ico sm"><PinIcon /></span><div><small>Workshop</small><b>{s.address}</b></div></div>
              {s.hours && <div className="ci-row"><span className="cc-ico sm"><ClockIcon /></span><div><small>Opening hours</small><b>{s.hours}</b></div></div>}
              <div className="ci-row"><span className="cc-ico sm wa"><WhatsAppIcon width={20} height={20} /></span><div><small>Fastest response</small><b>WhatsApp — share photos and links directly</b></div></div>
            </div>
          </aside>
        </div>

        <section className="contact-faq">
          <div className="head">
            <div>
              <h2>Frequently asked questions</h2>
            </div>
          </div>
          <div className="accordion">
            {FAQ.map(([q, a, href, cta]) => (
              <details key={q}>
                <summary>{q}</summary>
                <div className="content">
                  <p className="muted">{a}</p>
                  <Link href={href} className="btn sm">{cta}</Link>
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
