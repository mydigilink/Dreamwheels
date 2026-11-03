'use client';
import Link from 'next/link';
import { use } from 'react';
import { Toolbar, Section, Row, Toggle, MediaField, Pill, Counter, useCollection } from '@/components/admin/ui';
import { useEditor } from '@/components/admin/useEditor';
import { BRAND_TYPES, brandInitials, brandKey } from '@/lib/brands';
import { slugify } from '@/lib/site';

const BLANK = { name: '', slug: '', logo: '', types: [], country: '', founded: '', description: '', featured: false, order: '', published: true };

export default function BrandEditor({ params }) {
  const { id } = use(params);
  const { form, set, save, remove, saving, dirty, isNew } = useEditor('brands', id, BLANK, '/admin/brands/');
  const { items: vehicles } = useCollection('vehicles');
  if (!form) return <><Toolbar title="Loading…" /><div className="m-content" /></>;

  const path = `/brands/${form.slug || slugify(form.name) || 'new-brand'}/`;
  const used = (vehicles || []).filter((v) => brandKey(v.brand) === brandKey(form.name)).length;
  const toggleType = (t) => set('types')(form.types.includes(t) ? form.types.filter((x) => x !== t) : [...form.types, t]);

  return (
    <>
      <Toolbar title={isNew ? 'New Brand' : form.name || 'Untitled'} sub={dirty ? '— Edited' : ''}>
        {!isNew && form.published && <a className="m-btn m-hide-mobile" href={path} target="_blank" rel="noopener">View ↗</a>}
        <Link href="/admin/brands/" className="m-btn m-hide-mobile">Cancel</Link>
        <button className="m-btn primary" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </Toolbar>
      <div className="m-content">
        <div className="m-page">
          <Section title="Visibility">
            <Row label="Published" hint="Brand page and logo visible on the website"><Pill status={form.published ? 'live' : 'draft'}>{form.published ? 'Live' : 'Hidden'}</Pill><Toggle on={form.published} onChange={set('published')} label="Published" /></Row>
            <Row label="Featured" hint="Shown in “Shop by brand” on the home page"><Toggle on={form.featured} onChange={set('featured')} label="Featured" /></Row>
            <Row label="Display order" hint="Lower numbers appear first"><input className="m-input" inputMode="numeric" value={form.order ?? ''} onChange={set('order')} style={{ maxWidth: 100 }} placeholder="Auto" /></Row>
          </Section>

          <Section title="Logo" hint="Square image works best (at least 400 × 400). Transparent PNG or a logo on white looks cleanest. The first image is used.">
            <div className="m-row stack">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="brand-preview">
                  {form.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logo} alt="" />
                  ) : (
                    <span>{brandInitials(form.name)}</span>
                  )}
                </div>
                <div style={{ flex: '1 1 260px' }}>
                  <MediaField value={form.logo ? [form.logo] : []} onChange={(v) => set('logo')(v[0] || '')} multiple={false} label="Upload logo" />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Details">
            <Row label="Name"><input className="m-input" value={form.name} onChange={set('name')} placeholder="e.g. Royal Enfield" /></Row>
            {!isNew && used > 0 && <p className="m-hint">Used by {used} {used === 1 ? 'vehicle' : 'vehicles'}. Renaming updates them automatically.</p>}
            <Row label="URL slug" hint={isNew ? 'Auto-generated if empty' : 'Changing this changes the brand page URL'}>
              <input className="m-input" value={form.slug} onChange={(e) => set('slug')(slugify(e.target.value))} placeholder={slugify(form.name)} />
            </Row>
            <Row label="Vehicle types" hint="Controls which brand lists it appears in (e.g. the Sell form)">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', justifyContent: 'flex-end' }}>
                {BRAND_TYPES.map((t) => (
                  <label key={t} className="m-check"><input type="checkbox" checked={form.types.includes(t)} onChange={() => toggleType(t)} />{t}</label>
                ))}
              </div>
            </Row>
            <Row label="Country of origin"><input className="m-input" value={form.country} onChange={set('country')} placeholder="e.g. United Kingdom" /></Row>
            <Row label="Founded"><input className="m-input" value={form.founded} onChange={set('founded')} placeholder="e.g. 1901" style={{ maxWidth: 140 }} /></Row>
          </Section>

          <Section title="Brand page" hint="Intro text shown on the brand page. Markdown supported: ## headings, - lists, **bold**.">
            <div className="m-row stack"><textarea className="m-textarea" rows={7} value={form.description} onChange={set('description')} placeholder="A short history of the brand and what to look for in its classic models…" /></div>
            <Row label="Length"><Counter value={form.description} max={1200} /></Row>
          </Section>

          {!isNew && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="m-btn danger" onClick={() => remove(form.name)}>Delete brand</button>
              <button className="m-btn primary" onClick={() => save()} disabled={saving}>Save changes</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
