'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toolbar, Section, Row, Toggle, api, useSaveShortcut } from '@/components/admin/ui';
import { useShell } from '@/components/admin/AdminShell';

export default function SettingsPage() {
  const shell = useShell();
  const router = useRouter();
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/api/admin/config/settings/').then(setS).catch((e) => shell.notify(e.message, 'err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    try {
      setS(await api('/api/admin/config/settings/', { method: 'PUT', body: s }));
      shell.notify('Settings saved');
      router.refresh();
    } catch (e) {
      shell.notify(e.message, 'err');
    }
    setSaving(false);
  }
  useSaveShortcut(save);

  if (!s) return <><Toolbar title="Settings" /><div className="m-content" /></>;
  const set = (k) => (e) => setS((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));

  return (
    <>
      <Toolbar title="Settings">
        <button className="m-btn primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </Toolbar>
      <div className="m-content">
        <div className="m-page">
          <Section title="Business">
            <Row label="Site name"><input className="m-input" value={s.siteName} onChange={set('siteName')} /></Row>
            <Row label="Tagline" hint="Shown in the top bar"><input className="m-input" value={s.tagline} onChange={set('tagline')} /></Row>
            <Row label="Phone"><input className="m-input" value={s.phone} onChange={set('phone')} /></Row>
            <Row label="Email"><input className="m-input" type="email" value={s.email} onChange={set('email')} /></Row>
            <Row label="Address" hint="Also used for the map on the Contact page"><input className="m-input" value={s.address} onChange={set('address')} /></Row>
            <Row label="Opening hours" hint="Shown on the Contact page, e.g. Mon–Sat, 10 am – 7 pm"><input className="m-input" value={s.hours || ''} onChange={set('hours')} placeholder="Leave empty to hide" /></Row>
          </Section>

          <Section title="WhatsApp" hint="All WhatsApp buttons open a chat with this number, pre-filled with the vehicle / product name, category and page link.">
            <Row label="WhatsApp number" hint="With country code, digits only"><input className="m-input" value={s.whatsapp} onChange={set('whatsapp')} placeholder="919044988899" /></Row>
            <Row label="Test"><a className="m-btn green" href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener">Open chat ↗</a></Row>
          </Section>

          <Section title="Spare parts store">
            <Row label="Free shipping above (₹)"><input className="m-input" inputMode="numeric" value={s.freeShippingAbove} onChange={set('freeShippingAbove')} style={{ maxWidth: 140 }} /></Row>
            <Row label="Shipping fee (₹)" hint="Charged below the free-shipping amount"><input className="m-input" inputMode="numeric" value={s.shippingFee} onChange={set('shippingFee')} style={{ maxWidth: 140 }} /></Row>
            <Row label="Cash on delivery"><Toggle on={s.codEnabled} onChange={set('codEnabled')} label="Cash on delivery" /></Row>
          </Section>

          <Section title="Customer uploads" hint="Applies to Sell Your Vehicle and Restoration forms. Images are resized and converted to WebP on upload.">
            <Row label="Max photos per form"><input className="m-input" inputMode="numeric" value={s.maxUploadImages} onChange={set('maxUploadImages')} style={{ maxWidth: 100 }} /></Row>
            <Row label="Max size per photo (MB)"><input className="m-input" inputMode="numeric" value={s.maxUploadMb} onChange={set('maxUploadMb')} style={{ maxWidth: 100 }} /></Row>
          </Section>

          <Section title="Account">
            <Row label="Admin login" hint="Username & password are set with ADMIN_USER / ADMIN_PASSWORD environment variables on the server.">
              <span style={{ color: 'var(--m-text-2)' }}>Managed by server</span>
            </Row>
          </Section>
        </div>
      </div>
    </>
  );
}
