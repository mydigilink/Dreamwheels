'use client';
import Link from 'next/link';
import { use } from 'react';
import { Toolbar, Section, Row, Seg, Toggle, MediaField, TagInput, Pill } from '@/components/admin/ui';
import { WhatsAppPreview } from '@/components/admin/Previews';
import { useEditor } from '@/components/admin/useEditor';
import { absUrl, discountPct, PART_CATEGORIES, slugify } from '@/lib/site';
import { partMessage } from '@/lib/whatsapp';

const BLANK = {
  title: '', slug: '', sku: '', brand: 'DreamWheels', category: PART_CATEGORIES[0], compatibility: [], price: '', compareAt: '', stock: 0,
  mode: 'checkout', images: [], short: '', description: '', specs: [], published: false,
};

export default function PartEditor({ params }) {
  const { id } = use(params);
  const { form, set, save, remove, saving, dirty, isNew } = useEditor('parts', id, BLANK, '/admin/parts/');
  if (!form) return <><Toolbar title="Loading…" /><div className="m-content" /></>;

  const path = `/spare-parts/${form.slug || slugify(form.title) || 'new-part'}/`;
  const pct = discountPct(Number(form.price), Number(form.compareAt));
  const setSpec = (i, k) => (e) => set('specs')(form.specs.map((s, n) => (n === i ? { ...s, [k]: e.target.value } : s)));

  return (
    <>
      <Toolbar title={isNew ? 'New Spare Part' : form.title || 'Untitled'} sub={dirty ? '— Edited' : ''}>
        {!isNew && form.published && <a className="m-btn m-hide-mobile" href={path} target="_blank" rel="noopener">View ↗</a>}
        <Link href="/admin/parts/" className="m-btn m-hide-mobile">Cancel</Link>
        <button className="m-btn primary" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </Toolbar>
      <div className="m-content">
        <div className="m-page">
          <Section title="Visibility & selling">
            <Row label="Published"><Pill status={form.published ? 'live' : 'draft'}>{form.published ? 'Live' : 'Draft'}</Pill><Toggle on={form.published} onChange={set('published')} label="Published" /></Row>
            <Row label="Sold as" hint="Checkout = add to cart · Enquiry = WhatsApp / form only">
              <Seg value={form.mode} onChange={set('mode')} options={[['checkout', 'Cart & checkout'], ['enquiry', 'Enquiry only']]} />
            </Row>
          </Section>

          <Section title="Product">
            <Row label="Title"><input className="m-input" value={form.title} onChange={set('title')} placeholder="e.g. Wiring Harness for Royal Enfield Bullet 350" /></Row>
            <Row label="URL slug"><input className="m-input" value={form.slug} onChange={(e) => set('slug')(slugify(e.target.value))} placeholder={slugify(form.title)} /></Row>
            <Row label="SKU"><input className="m-input" value={form.sku} onChange={set('sku')} style={{ maxWidth: 200 }} /></Row>
            <Row label="Brand / vendor"><input className="m-input" value={form.brand} onChange={set('brand')} /></Row>
            <Row label="Category">
              <select className="m-select" value={form.category} onChange={set('category')}>
                {PART_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Row>
            <Row label="Compatible with" hint="Press Enter after each model"><TagInput value={form.compatibility} onChange={set('compatibility')} placeholder="Royal Enfield Bullet 350" /></Row>
          </Section>

          <Section title="Pricing & inventory" hint={pct ? `Customers see “Save ${pct}%” with the compare-at price struck through.` : 'Set a compare-at (MRP) price above the selling price to show a discount.'}>
            <Row label="Price (₹)"><input className="m-input" inputMode="numeric" value={form.price ?? ''} onChange={set('price')} style={{ maxWidth: 160 }} /></Row>
            <Row label="Compare-at / MRP (₹)"><input className="m-input" inputMode="numeric" value={form.compareAt ?? ''} onChange={set('compareAt')} style={{ maxWidth: 160 }} /></Row>
            <Row label="Stock" hint="Decreases automatically with each order">
              <button className="m-btn icon" type="button" onClick={() => set('stock')(Math.max(0, Number(form.stock) - 1))}>−</button>
              <input className="m-input" inputMode="numeric" value={form.stock} onChange={set('stock')} style={{ maxWidth: 80, textAlign: 'center' }} />
              <button className="m-btn icon" type="button" onClick={() => set('stock')(Number(form.stock) + 1)}>+</button>
            </Row>
          </Section>

          <Section title="Images" right="First image = cover & share image">
            <div className="m-row stack"><MediaField value={form.images} onChange={set('images')} /></div>
          </Section>

          <Section title="Description" hint="Markdown supported.">
            <Row label="Short description" hint="Shown near the price"><input className="m-input" value={form.short} onChange={set('short')} /></Row>
            <div className="m-row stack"><textarea className="m-textarea" rows={8} value={form.description} onChange={set('description')} /></div>
          </Section>

          <Section title="Specifications" right={<button className="m-btn plain" style={{ color: 'var(--m-accent)' }} onClick={() => set('specs')([...form.specs, { k: '', v: '' }])}>+ Add row</button>}>
            {form.specs.length === 0 && <div className="m-row"><span style={{ color: 'var(--m-text-2)' }}>No specifications yet.</span></div>}
            {form.specs.map((s, i) => (
              <div className="m-row" key={i}>
                <input className="m-input" value={s.k} onChange={setSpec(i, 'k')} placeholder="Material" style={{ flex: '0 0 34%' }} />
                <div className="ctl">
                  <input className="m-input" value={s.v} onChange={setSpec(i, 'v')} placeholder="Copper core" />
                  <button className="m-btn plain icon" onClick={() => set('specs')(form.specs.filter((_, n) => n !== i))} aria-label="Remove row">⊖</button>
                </div>
              </div>
            ))}
          </Section>

          <Section title="WhatsApp enquiry preview">
            <div className="m-row stack">
              <WhatsAppPreview image={form.images[0]} title={form.title} description={form.short} path={path} message={partMessage({ name: form.title, sku: form.sku, url: absUrl(path) })} />
            </div>
          </Section>

          {!isNew && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="m-btn danger" onClick={() => remove(form.title)}>Delete part</button>
              <button className="m-btn primary" onClick={() => save()} disabled={saving}>Save changes</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
