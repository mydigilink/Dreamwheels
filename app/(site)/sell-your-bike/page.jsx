import Link from 'next/link';
import SellForm from '@/components/forms/SellForm';
import VehicleCard from '@/components/VehicleCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getBrands, getCategories, getSettings, getVehicles } from '@/lib/db';
import { absUrl, MODULES } from '@/lib/site';
import { sellMessage } from '@/lib/whatsapp';

export const metadata = {
  title: 'Sell Your Bike or Car — Vintage & Classic Vehicles',
  description: 'Sell your vintage bike, scooter, classic car or super bike through DreamWheels. Submit details and photos, our team evaluates every vehicle and lists approved ones in the marketplace.',
  alternates: { canonical: '/sell-your-bike/' },
};

export default async function SellPage() {
  const [settings, categories, vehicles, brands] = await Promise.all([getSettings(), getCategories(), getVehicles(), getBrands()]);
  const catNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const ownerListings = vehicles.filter((v) => v.source === 'sell-your-vehicle');
  const listings = (ownerListings.length ? ownerListings : vehicles.filter((v) => v.availability !== 'Sold')).slice(0, 6);
  const url = absUrl('/sell-your-bike/');

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>Sell Your Vehicle</span></nav>

      <div className="split" style={{ padding: '20px 0 40px' }}>
        <div className="sticky">
          <span className="kicker">Sell with DreamWheels</span>
          <h1 style={{ margin: '8px 0 16px' }}>Sell your bike, scooter or car</h1>
          <p className="muted" style={{ fontSize: 16 }}>
            Own a vintage motorcycle, scooter, classic car or super bike? Tell us about it. Our specialists review every submission and list the
            right vehicles in front of serious collectors — no open-marketplace haggling, no spam calls.
          </p>
          <div className="service-list">
            <div><span className="svc-ico">1</span><div><b>Submit details & photos</b><span>Takes about 3 minutes on your phone.</span></div></div>
            <div><span className="svc-ico">2</span><div><b>We evaluate</b><span>Condition, documents and market suitability are reviewed by our team.</span></div></div>
            <div><span className="svc-ico">3</span><div><b>Approved vehicles get listed</b><span>Professionally presented in the right marketplace category.</span></div></div>
          </div>
          <WhatsAppButton
            number={settings.whatsapp}
            className="btn wa"
            message={sellMessage({ url })}
            lead={{ module: MODULES.sell, itemName: 'Sell enquiry', category: '', pageUrl: url }}
          >
            Questions? Ask on WhatsApp
          </WhatsAppButton>
        </div>
        <div className="panel">
          <SellForm maxImages={settings.maxUploadImages} maxMb={settings.maxUploadMb} brands={brands.map(({ name, types }) => ({ name, types }))} />
        </div>
      </div>

      {listings.length > 0 && (
        <section className="section tight">
          <div className="head">
            <div>
              <span className="kicker">{ownerListings.length ? 'Listed by owners' : 'Recently listed'}</span>
              <h2>Vehicles on DreamWheels</h2>
            </div>
            <Link href="/vintage-bikes/" className="btn">Browse marketplace</Link>
          </div>
          <div className="grid">
            {listings.map((v) => <VehicleCard key={v.id} v={v} categoryName={catNames[v.category]} whatsapp={settings.whatsapp} />)}
          </div>
        </section>
      )}

      <section className="section tight">
        <div className="panel prose">
          <h2 style={{ marginTop: 0 }}>Selling a vintage vehicle with DreamWheels</h2>
          <p>
            We accept classic and vintage motorcycles (Royal Enfield, Jawa, Yezdi, BSA, Rajdoot and more), vintage scooters such as Lambretta and Vespa,
            classic cars and well-kept super bikes. Original documents, matching numbers and an honest description of condition help us evaluate faster.
          </p>
          <p>Submitting does not guarantee a listing. If your vehicle needs work first, our <Link href="/restoration/">restoration workshop</Link> can help.</p>
        </div>
      </section>
    </div>
  );
}
