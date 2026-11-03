import Link from 'next/link';
import BrandStrip from '@/components/BrandStrip';
import { getBrands, getVehicles } from '@/lib/db';

export const metadata = {
  title: 'Shop by Brand — Vintage Bikes, Scooters & Classic Cars',
  description: 'Browse vintage and classic vehicles and spare parts by brand: Royal Enfield, Jawa, Yezdi, BSA, Lambretta, Vespa, Fiat and more.',
  alternates: { canonical: '/brands/' },
};

const GROUPS = [
  ['Bike', 'Motorcycles'],
  ['Scooter', 'Scooters'],
  ['Car', 'Cars'],
];

export default async function BrandsPage() {
  const [brands, vehicles] = await Promise.all([getBrands(), getVehicles()]);
  const counts = {};
  for (const v of vehicles) counts[(v.brand || '').trim().toLowerCase()] = (counts[(v.brand || '').trim().toLowerCase()] || 0) + 1;
  const untyped = brands.filter((b) => !b.types?.length);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>Brands</span></nav>
      <header className="page-hero">
        <h1>Shop by brand</h1>
        <p className="intro">Vintage and classic vehicles, spare parts and restoration for the marques we know best.</p>
      </header>

      {GROUPS.map(([type, label]) => {
        const list = brands.filter((b) => b.types?.includes(type));
        if (!list.length) return null;
        return (
          <section key={type} className="brand-section">
            <h2>{label}</h2>
            <BrandStrip brands={list} counts={counts} />
          </section>
        );
      })}
      {untyped.length > 0 && (
        <section className="brand-section">
          <h2>Other brands</h2>
          <BrandStrip brands={untyped} counts={counts} />
        </section>
      )}
    </div>
  );
}
