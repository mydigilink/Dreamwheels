'use client';
import { useState } from 'react';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f0ede7"/><text x="200" y="156" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="16" font-weight="600" fill="#a39d92">DreamWheels</text></svg>'
  );

/** Lazy image with a branded placeholder if the source fails. */
export default function Img({ src, alt = '', eager = false, ...rest }) {
  const [failed, setFailed] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed || !src ? FALLBACK : src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
