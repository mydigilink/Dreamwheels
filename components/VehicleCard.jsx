import Link from 'next/link';
import Img from './Img';
import WhatsAppButton from './WhatsAppButton';
import SaveButton from './account/SaveButton';
import { absUrl, formatINR, MODULES, vehicleUrl } from '@/lib/site';
import { vehicleMessage } from '@/lib/whatsapp';

export function vehicleLead(v, categoryName) {
  const url = absUrl(vehicleUrl(v));
  return {
    url,
    message: vehicleMessage({ name: v.title, category: categoryName, url }),
    lead: { module: MODULES.marketplace, itemName: v.title, itemId: v.id, category: categoryName, pageUrl: url },
  };
}

export default function VehicleCard({ v, categoryName, whatsapp, eager = false }) {
  const href = vehicleUrl(v);
  const wa = vehicleLead(v, categoryName);
  const sold = v.availability === 'Sold';
  return (
    <article className="vcard">
      <Link href={href} className="media" aria-label={v.title}>
        <Img src={v.images?.[0]} alt={v.title} eager={eager} />
        <div className="badges">
          {v.condition && <span className="badge">{v.condition}</span>}
          {v.availability === 'Reserved' && <span className="badge reserved">Reserved</span>}
          {sold && <span className="badge sold">Sold</span>}
          {v.video && <span className="badge gold">▶ Video</span>}
        </div>
      </Link>
      <SaveButton type="vehicle" id={v.id} title={v.title} />
      <div className="body">
        <div className="meta">
          <span>{v.year}</span>·<span>{categoryName}</span>
        </div>
        <h3><Link href={href}>{v.title}</Link></h3>
        <div className="price">{sold ? 'Sold' : formatINR(v.price)}</div>
      </div>
      <div className="ctas">
        <Link href={`${href}#enquire`} className="btn sm dark">Enquire</Link>
        <WhatsAppButton number={whatsapp} message={wa.message} lead={wa.lead} className="btn sm wa">WhatsApp</WhatsAppButton>
      </div>
    </article>
  );
}
