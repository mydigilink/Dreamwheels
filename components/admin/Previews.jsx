'use client';
import { absUrl } from '@/lib/site';

/** How the page link unfurls in WhatsApp, using the page's OG data. */
export function WhatsAppPreview({ image, title, description, path, message }) {
  const url = absUrl(path);
  return (
    <div className="m-wa-preview">
      <div className="m-wa-bubble">
        <div className="m-wa-card">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" />
          ) : (
            <div style={{ aspectRatio: '1.91/1', display: 'grid', placeItems: 'center', background: '#ddd', color: '#a33', fontSize: 12 }}>No OG image — add a photo</div>
          )}
          <div>
            <b>{title || 'Untitled'}</b>
            <small>{description}</small>
            <i>{url.replace(/^https?:\/\//, '').split('/')[0]}</i>
          </div>
        </div>
        <div className="m-wa-text">{message || url}</div>
      </div>
    </div>
  );
}

export function SerpPreview({ title, description, path }) {
  return (
    <div className="m-serp">
      <div className="u">{absUrl(path)}</div>
      <div className="t">{(title || 'Untitled').slice(0, 65)} | DreamWheels</div>
      <div className="d">{(description || 'Add a description…').slice(0, 160)}</div>
    </div>
  );
}
