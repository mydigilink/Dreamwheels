import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { brandUrl } from '@/lib/brands';

/** Grid of brand logo tiles linking to each brand page. `counts` maps brand name (lowercase) → listings. */
export default function BrandStrip({ brands, counts = {}, size = 64 }) {
  return (
    <div className="brand-grid">
      {brands.map((b) => {
        const n = counts[b.name.toLowerCase()] || 0;
        return (
          <Link key={b.id} href={brandUrl(b)} className="brand-tile">
            <BrandLogo brand={b} size={size} />
            <b>{b.name}</b>
            <small>{n ? `${n} ${n === 1 ? 'listing' : 'listings'}` : b.types?.join(' · ') || 'View brand'}</small>
          </Link>
        );
      })}
    </div>
  );
}
