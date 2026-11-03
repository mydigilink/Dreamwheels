'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Inbox from '@/components/admin/Inbox';
import { Avatar, api } from '@/components/admin/ui';
import { useShell } from '@/components/admin/AdminShell';
import { formatDateTime, formatINR } from '@/lib/site';
import { waLink } from '@/lib/whatsapp';

function SubmissionDetail({ item: s }) {
  const router = useRouter();
  const shell = useShell();

  async function convert() {
    const ok = await shell.confirm({
      icon: '🏍',
      title: 'Create a marketplace listing?',
      message: 'A draft listing is created from this submission (photos and details copied). You can edit it before publishing.',
      confirm: 'Create draft',
    });
    if (!ok) return;
    try {
      const v = await api(`/api/admin/convert/${s.id}/`, { method: 'POST' });
      shell.notify('Draft listing created');
      router.push(`/admin/vehicles/${v.id}/`);
    } catch (e) {
      shell.notify(e.message, 'err');
    }
  }

  return (
    <>
      <div className="m-detail-head">
        <Avatar name={s.name} />
        <div style={{ flex: 1 }}>
          <h2>{s.brand} {s.model} ({s.year})</h2>
          <p>{s.vehicleType} · submitted by {s.name} · {formatDateTime(s.createdAt)}</p>
        </div>
      </div>

      <div className="m-gallery" style={{ marginBottom: 16 }}>
        {s.images.map((src) => (
          <a key={src} href={src} target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
          </a>
        ))}
      </div>

      <dl className="m-kv">
        <dt>Vehicle</dt><dd>{s.vehicleType} — {s.brand} {s.model}</dd>
        <dt>Year</dt><dd>{s.year}</dd>
        <dt>Registration</dt><dd>{s.registrationState}</dd>
        <dt>Odometer</dt><dd>{s.kmsDriven || '—'}</dd>
        <dt>Expected price</dt><dd>{s.expectedPrice ? formatINR(s.expectedPrice) : 'Not specified'}</dd>
        <dt>Phone</dt><dd><a href={`tel:${s.phone}`}>{s.phone}</a></dd>
        {s.email && <><dt>Email</dt><dd><a href={`mailto:${s.email}`}>{s.email}</a></dd></>}
        <dt>City</dt><dd>{s.city || '—'}</dd>
      </dl>
      <div className="m-message">{s.condition}</div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {s.listingId ? (
          <Link href={`/admin/vehicles/${s.listingId}/`} className="m-btn primary">Open listing →</Link>
        ) : (
          <button className="m-btn primary" onClick={convert}>✓ Approve & create listing</button>
        )}
        <a className="m-btn green" target="_blank" rel="noopener" href={waLink(s.phone, `Hi ${s.name}, thanks for submitting your ${s.brand} ${s.model} to DreamWheels. `)}>WhatsApp seller</a>
      </div>
    </>
  );
}

export default function SubmissionsPage() {
  return (
    <Inbox
      collection="submissions"
      title="Sell Requests"
      icon="⇄"
      newStatus="pending"
      statuses={[['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']]}
      filters={[
        { key: 'bike', label: 'Bikes', test: (s) => s.vehicleType === 'Bike' },
        { key: 'car', label: 'Cars', test: (s) => s.vehicleType === 'Car' },
      ]}
      searchText={(s) => `${s.brand} ${s.model} ${s.year} ${s.name} ${s.phone} ${s.city}`}
      summary={(s) => ({ title: s.name, subtitle: `${s.vehicleType === 'Car' ? '🚗' : '🏍'} ${s.brand} ${s.model} (${s.year})`, preview: s.condition })}
      Detail={SubmissionDetail}
    />
  );
}
