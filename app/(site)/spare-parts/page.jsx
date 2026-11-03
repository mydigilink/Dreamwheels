import Link from 'next/link';
import PartsExplorer from '@/components/parts/PartsExplorer';
import { getBrands, getParts, getSettings } from '@/lib/db';

export const metadata = {
  title: 'Vintage Bike Spare Parts & Body Panels — Buy Online',
  description: 'Shop genuine and reproduction spare parts for vintage bikes and scooters — Royal Enfield, Jawa, Yezdi, BSA, Lambretta, Vespa. Fast shipping, COD available.',
  // Filtered/search views (?q=, ?cat=) canonicalise to the main listing to avoid duplicate content.
  alternates: { canonical: '/spare-parts/' },
};

export default async function SparePartsPage({ searchParams }) {
  const sp = await searchParams;
  const [parts, settings, brands] = await Promise.all([getParts(), getSettings(), getBrands()]);
  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>Spare Parts</span>
      </nav>
      <header className="page-hero">
        <h1>Vintage spare parts</h1>
        <p className="intro">
          Engine, electrical, body panels and more for Royal Enfield, Jawa, Yezdi, BSA, Lambretta and Vespa. Free shipping above ₹
          {settings.freeShippingAbove.toLocaleString('en-IN')}{settings.codEnabled ? ' · Cash on delivery available' : ''}.
        </p>
      </header>
      <section style={{ paddingBottom: 48 }}>
        <PartsExplorer parts={parts} brandMaster={brands.map(({ id, name, logo }) => ({ id, name, logo }))} initialQuery={typeof sp.q === 'string' ? sp.q : ''} initialCat={typeof sp.cat === 'string' ? sp.cat : ''} />
      </section>
    </div>
  );
}
