'use client';
import Inbox from '@/components/admin/Inbox';
import { Avatar, Pill } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/site';
import { waLink } from '@/lib/whatsapp';

const FILTERS = [
  { key: 'wa', label: 'WhatsApp', test: (l) => l.type === 'whatsapp' },
  { key: 'form', label: 'Forms', test: (l) => l.type === 'form' },
];

function LeadDetail({ item: l }) {
  const who = l.name || (l.type === 'whatsapp' ? 'WhatsApp click' : 'Anonymous');
  return (
    <>
      <div className="m-detail-head">
        <Avatar name={l.name || 'W A'} />
        <div style={{ flex: 1 }}>
          <h2>{who}</h2>
          <p>{formatDateTime(l.createdAt)} · <Pill status={l.type === 'whatsapp' ? 'approved' : 'new'}>{l.type === 'whatsapp' ? 'WhatsApp' : 'Enquiry form'}</Pill></p>
        </div>
      </div>
      {l.type === 'whatsapp' && (
        <div className="m-warn" style={{ background: 'var(--m-accent-soft)', color: 'inherit' }}>
          ℹ︎ The visitor opened WhatsApp with this pre-filled message. Their number will appear in your WhatsApp Business chat — match it using the vehicle name and time.
        </div>
      )}
      <dl className="m-kv">
        <dt>Interested in</dt><dd><b>{l.itemName || '—'}</b></dd>
        <dt>Category</dt><dd>{l.category || '—'}</dd>
        <dt>Source module</dt><dd>{l.module || '—'}</dd>
        <dt>Page</dt><dd>{l.pageUrl ? <a href={l.pageUrl} target="_blank" rel="noopener">{l.pageUrl}</a> : '—'}</dd>
        {l.phone && <><dt>Phone</dt><dd><a href={`tel:${l.phone}`}>{l.phone}</a></dd></>}
        {l.email && <><dt>Email</dt><dd><a href={`mailto:${l.email}`}>{l.email}</a></dd></>}
      </dl>
      {l.message && <div className="m-message">{l.message}</div>}
      {l.phone && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <a className="m-btn green" target="_blank" rel="noopener" href={waLink(l.phone, `Hi ${l.name || ''}, thanks for your enquiry about ${l.itemName} at DreamWheels.`)}>Reply on WhatsApp</a>
          <a className="m-btn" href={`tel:${l.phone}`}>Call</a>
          {l.email && <a className="m-btn" href={`mailto:${l.email}?subject=${encodeURIComponent(`Your enquiry: ${l.itemName}`)}`}>Email</a>}
        </div>
      )}
    </>
  );
}

export default function LeadsPage() {
  return (
    <Inbox
      collection="leads"
      title="Leads"
      icon="✉"
      newStatus="new"
      statuses={[['new', 'New'], ['contacted', 'Contacted'], ['closed', 'Closed']]}
      filters={FILTERS}
      searchText={(l) => `${l.name} ${l.phone} ${l.email} ${l.itemName} ${l.module} ${l.category}`}
      summary={(l) => ({
        title: l.name || (l.type === 'whatsapp' ? '💬 WhatsApp click' : 'Anonymous'),
        subtitle: l.itemName,
        preview: `${l.module}${l.message ? ' — ' + l.message : ''}`,
      })}
      Detail={LeadDetail}
    />
  );
}
