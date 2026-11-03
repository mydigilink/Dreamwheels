'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MailIcon, WhatsAppIcon } from '../Icons';
import { formatINR } from '@/lib/site';

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

/** Announcement strip: rotating messages on the left, quick contact on the right. */
export default function TopBar({ settings }) {
  const messages = [
    { text: settings.tagline, href: '/vintage-bikes/', cta: 'Explore' },
    { text: `Free shipping on spare parts over ${formatINR(settings.freeShippingAbove)}${settings.codEnabled ? ' · COD available' : ''}`, href: '/spare-parts/', cta: 'Shop parts' },
    { text: 'Restoration bookings now open', href: '/restoration/', cta: 'Book now' },
    { text: 'Selling a classic bike or car? List it with us', href: '/sell-your-bike/', cta: 'Get started' },
  ];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4500);
    return () => clearInterval(t);
  }, [paused, messages.length]);

  const m = messages[i];
  const tel = settings.phone.replace(/\s/g, '');

  return (
    <div className="topbar" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="wrap">
        <div className="tb-msg" aria-live="polite">
          <Link key={i} href={m.href} className="tb-text">
            {m.text} <b>{m.cta}</b>
          </Link>
          <span className="tb-dots" aria-hidden="true">
            {messages.map((_, n) => <i key={n} className={n === i ? 'on' : ''} />)}
          </span>
        </div>
        <div className="tb-contact">
          <a href={`tel:${tel}`} aria-label={`Call ${settings.phone}`}><PhoneIcon /><span>{settings.phone}</span></a>
          <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener" aria-label="WhatsApp" className="tb-wa"><WhatsAppIcon width={14} height={14} /><span>WhatsApp</span></a>
          <a href={`mailto:${settings.email}`} aria-label={`Email ${settings.email}`} className="tb-mail"><MailIcon width={14} height={14} /><span>{settings.email}</span></a>
        </div>
      </div>
    </div>
  );
}
