import { brandInitials } from '@/lib/brands';

/** Brand logo in a fixed square, or a monogram until a logo is uploaded. */
export default function BrandLogo({ brand, size = 56, className = '' }) {
  const style = { width: size, height: size };
  if (brand?.logo)
    return (
      <span className={`brand-logo ${className}`} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logo} alt={`${brand.name} logo`} loading="lazy" decoding="async" />
      </span>
    );
  return (
    <span className={`brand-logo mono ${className}`} style={{ ...style, fontSize: Math.round(size * 0.32) }} aria-hidden="true">
      {brandInitials(brand?.name)}
    </span>
  );
}
