'use client';
import { useState } from 'react';
import { WhatsAppIcon } from '../Icons';

const svg = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true };

export default function ShareButtons({ url, title, vertical = false, compact = false }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }
  async function native() {
    try {
      await navigator.share({ title, url });
    } catch {}
  }

  return (
    <div className={`share ${vertical ? 'vertical' : ''} ${compact ? 'compact' : ''}`}>
      {!compact && <span className="share-label">Share</span>}
      <a className="share-btn wa" href={`https://wa.me/?text=${t}%0A${u}`} target="_blank" rel="noopener" aria-label="Share on WhatsApp"><WhatsAppIcon width={18} height={18} /></a>
      <a className="share-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener" aria-label="Share on Facebook">
        <svg {...svg}><path d="M14 8.5V6.8c0-.8.5-1 .9-1H17V2.1L14.1 2C10.9 2 10.2 4.4 10.2 6v2.5H8v3.8h2.2V22H14v-9.7h2.9l.4-3.8z" /></svg>
      </a>
      <a className="share-btn" href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener" aria-label="Share on X">
        <svg {...svg}><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" /></svg>
      </a>
      <button type="button" className="share-btn" onClick={copy} aria-label="Copy link">
        {copied ? '✓' : <svg {...svg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>}
      </button>
      <button type="button" className="share-btn native" onClick={native} aria-label="More sharing options">
        <svg {...svg} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>
      </button>
      {copied && <span className="share-copied" role="status">Link copied</span>}
    </div>
  );
}
