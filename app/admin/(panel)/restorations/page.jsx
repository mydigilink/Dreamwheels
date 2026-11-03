'use client';
import Inbox from '@/components/admin/Inbox';
import { Avatar } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/site';
import { waLink } from '@/lib/whatsapp';

function RestorationDetail({ item: r }) {
  return (
    <>
      <div className="m-detail-head">
        <Avatar name={r.name} />
        <div style={{ flex: 1 }}>
          <h2>{r.brand} {r.model} ({r.year})</h2>
          <p>{r.vehicleType} · {r.name} · {formatDateTime(r.createdAt)}</p>
        </div>
      </div>
      <div className="m-gallery" style={{ marginBottom: 8 }}>
        {r.images.map((src) => (
          <a key={src} href={src} target="_blank" rel="noopener" download>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </a>
        ))}
      </div>
      <p className="m-hint" style={{ marginBottom: 14 }}>Click a photo to open or download it.</p>
      <dl className="m-kv">
        <dt>Vehicle</dt><dd>{r.vehicleType} — {r.brand} {r.model}, {r.year}</dd>
        <dt>Phone</dt><dd><a href={`tel:${r.phone}`}>{r.phone}</a></dd>
        {r.email && <><dt>Email</dt><dd><a href={`mailto:${r.email}`}>{r.email}</a></dd></>}
        <dt>City</dt><dd>{r.city || '—'}</dd>
      </dl>
      <div className="m-section-title">Current condition</div>
      <div className="m-message" style={{ marginTop: 0 }}>{r.condition}</div>
      <div className="m-section-title">Work requested</div>
      <div className="m-message" style={{ marginTop: 0 }}>{r.requirements}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a className="m-btn green" target="_blank" rel="noopener" href={waLink(r.phone, `Hi ${r.name}, this is the DreamWheels workshop regarding your ${r.brand} ${r.model} restoration request.`)}>Reply on WhatsApp</a>
        <a className="m-btn" href={`tel:${r.phone}`}>Call</a>
        {r.email && <a className="m-btn" href={`mailto:${r.email}?subject=${encodeURIComponent('Your restoration request')}`}>Email</a>}
      </div>
    </>
  );
}

export default function RestorationsPage() {
  return (
    <Inbox
      collection="restorations"
      title="Restoration"
      icon="🔧"
      newStatus="new"
      statuses={[['new', 'New'], ['in-review', 'In review'], ['contacted', 'Contacted'], ['quoted', 'Quoted'], ['closed', 'Closed']]}
      filters={[{ key: 'car', label: 'Cars', test: (r) => r.vehicleType === 'Car' }]}
      searchText={(r) => `${r.brand} ${r.model} ${r.year} ${r.name} ${r.phone} ${r.city} ${r.requirements}`}
      summary={(r) => ({ title: r.name, subtitle: `${r.brand} ${r.model} (${r.year})`, preview: r.requirements })}
      Detail={RestorationDetail}
    />
  );
}
