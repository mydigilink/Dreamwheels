'use client';
import { waLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from './Icons';

/**
 * Direct wa.me link (no redirect chain) with a pre-filled, contextual message.
 * Each click is logged as a lead via sendBeacon so WhatsApp enquiries are attributable
 * in the admin exactly like form enquiries (spec §2.11.5–2.11.6).
 */
export default function WhatsAppButton({ number, message, lead, className = 'btn wa', children, iconOnly = false, bare = false, ...rest }) {
  const href = waLink(number, message);

  function track() {
    if (!lead) return;
    try {
      const body = JSON.stringify({ type: 'whatsapp', ...lead, message });
      const blob = new Blob([body], { type: 'application/json' });
      if (!navigator.sendBeacon?.('/api/leads/', blob)) {
        fetch('/api/leads/', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
      }
    } catch {
      /* tracking must never block the chat */
    }
  }

  return (
    <a href={href} target="_blank" rel="noopener" className={className} onClick={track} aria-label={iconOnly ? 'Chat on WhatsApp' : undefined} {...rest}>
      {bare ? children : (
        <>
          {/* <WhatsAppIcon /> */}
          {!iconOnly && (children || 'WhatsApp')}
        </>
      )}
    </a>
  );
}
