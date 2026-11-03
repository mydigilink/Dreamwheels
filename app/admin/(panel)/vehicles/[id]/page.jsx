'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { Toolbar, Section, Row, Seg, Toggle, MediaField, Counter, Pill, api } from '@/components/admin/ui';
import { WhatsAppPreview, SerpPreview } from '@/components/admin/Previews';
import { useEditor } from '@/components/admin/useEditor';
import { toEmbed } from '@/components/media/VideoEmbed';
import { absUrl, AVAILABILITY, CONDITIONS, slugify } from '@/lib/site';
import { vehicleMessage } from '@/lib/whatsapp';
import { findBrand } from '@/lib/brands';

const BLANK = {
  title: '', slug: '', category: 'vintage-bikes', subcategories: [], brand: '', model: '', year: '', condition: 'Restored', availability: 'Available',
  price: '', engine: '', mileage: '', color: '', location: '', registration: '', summary: '', description: '', images: [], video: '', spin360: [],
  featured: false, published: false, seoTitle: '', seoDescription: '',
};

export default function VehicleEditor({ params }) {
  const { id } = use(params);
  const { form, set, setForm, save, remove, saving, dirty, isNew } = useEditor('vehicles', id, BLANK, '/admin/vehicles/');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    api('/api/admin/config/categories/').then(setCategories).catch(() => {});
    api('/api/admin/brands/')
      .then((list) => setBrands(list.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {});
  }, []);

  if (!form) return <><Toolbar title="Loading…" /><div className="m-content" /></>;

  const cat = categories.find((c) => c.slug === form.category);
  const path = `/${form.category}/${form.slug || slugify(form.title) || 'new-vehicle'}/`;
  const embed = toEmbed(form.video);
  const ogDescription = form.seoDescription || form.summary;
  const toggleSub = (s) => set('subcategories')(form.subcategories.includes(s) ? form.subcategories.filter((x) => x !== s) : [...form.subcategories, s]);

  return (
    <>
      <Toolbar title={isNew ? 'New Vehicle' : form.title || 'Untitled'} sub={dirty ? '— Edited' : ''}>
        {!isNew && form.published && <a className="m-btn m-hide-mobile" href={path} target="_blank" rel="noopener">View ↗</a>}
        <Link href="/admin/vehicles/" className="m-btn m-hide-mobile">Cancel</Link>
        <button className="m-btn primary" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </Toolbar>
      <div className="m-content">
        <div className="m-page">
          {!form.video && <div className="m-warn">▶ Video is mandatory on vehicle pages. Until one is added, visitors see a “request video on WhatsApp” button.</div>}
          {form.images.length === 0 && <div className="m-warn">📷 Add at least one photo — the first photo is used as the WhatsApp / social share image.</div>}

          <Section title="Visibility">
            <Row label="Published" hint="Visible on the website"><Pill status={form.published ? 'live' : 'draft'}>{form.published ? 'Live' : 'Draft'}</Pill><Toggle on={form.published} onChange={set('published')} label="Published" /></Row>
            <Row label="Featured" hint="Shown on the home page"><Toggle on={form.featured} onChange={set('featured')} label="Featured" /></Row>
            <Row label="Availability"><Seg value={form.availability} options={AVAILABILITY} onChange={set('availability')} /></Row>
          </Section>

          <Section title="Basics">
            <Row label="Title"><input className="m-input" value={form.title} onChange={set('title')} placeholder="e.g. Royal Enfield Bullet 350 (1972)" /></Row>
            <Row label="URL slug" hint={isNew ? 'Auto-generated if empty' : 'Changing this changes the page URL'}>
              <input className="m-input" value={form.slug} onChange={(e) => set('slug')(slugify(e.target.value))} placeholder={slugify(form.title)} />
            </Row>
            <Row label="Category">
              <select className="m-select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategories: [] }))}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </Row>
            {cat?.subcategories?.length > 0 && (
              <Row label="Sub-categories" hint="Brand, era, condition collections">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', justifyContent: 'flex-end' }}>
                  {cat.subcategories.map((s) => (
                    <label key={s.slug} className="m-check"><input type="checkbox" checked={form.subcategories.includes(s.slug)} onChange={() => toggleSub(s.slug)} />{s.name}</label>
                  ))}
                </div>
              </Row>
            )}
            <Row label="Brand" hint={<Link href="/admin/brands/" style={{ color: 'var(--m-accent)' }}>Manage brands</Link>}>
              <select className="m-select" value={form.brand} onChange={set('brand')}>
                <option value="">Select brand</option>
                {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                {form.brand && !findBrand(brands, form.brand) && <option value={form.brand}>{form.brand} (not in brand list)</option>}
              </select>
            </Row>
            <Row label="Model"><input className="m-input" value={form.model} onChange={set('model')} /></Row>
            <Row label="Year"><input className="m-input" inputMode="numeric" value={form.year ?? ''} onChange={set('year')} style={{ maxWidth: 120 }} /></Row>
            <Row label="Condition"><Seg value={form.condition} options={CONDITIONS} onChange={set('condition')} /></Row>
            <Row label="Price (₹)" hint="Leave empty for “Price on request”"><input className="m-input" inputMode="numeric" value={form.price ?? ''} onChange={set('price')} style={{ maxWidth: 180 }} /></Row>
          </Section>

          <Section title="Photos" right="Drag to add · first photo = cover & share image">
            <div className="m-row stack"><MediaField value={form.images} onChange={set('images')} /></div>
          </Section>

          <Section title="Video" hint="YouTube, Vimeo or a direct .mp4 link.">
            <Row label="Video URL"><input className="m-input" value={form.video} onChange={set('video')} placeholder="https://youtube.com/watch?v=…" /></Row>
            {embed && (
              <div className="m-row stack">
                <div style={{ aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                  {embed.kind === 'iframe' ? <iframe src={embed.src} title="Preview" style={{ width: '100%', height: '100%', border: 0 }} allowFullScreen /> : <video src={embed.src} controls style={{ width: '100%', height: '100%' }} />}
                </div>
              </div>
            )}
          </Section>

          <Section title="360° view" right={`${form.spin360.length} frames`} hint="Upload 24–72 photos taken at even angles around the vehicle, in order. The viewer appears once there are at least 8 frames.">
            <div className="m-row stack"><MediaField value={form.spin360} onChange={set('spin360')} label="Add frames" /></div>
          </Section>

          <Section title="Specifications">
            <Row label="Engine"><input className="m-input" value={form.engine} onChange={set('engine')} placeholder="346cc single" /></Row>
            <Row label="Odometer"><input className="m-input" value={form.mileage} onChange={set('mileage')} /></Row>
            <Row label="Colour"><input className="m-input" value={form.color} onChange={set('color')} /></Row>
            <Row label="Registration"><input className="m-input" value={form.registration} onChange={set('registration')} /></Row>
            <Row label="Location"><input className="m-input" value={form.location} onChange={set('location')} /></Row>
          </Section>

          <Section title="Description" hint="Markdown supported: ## headings, - lists, **bold**, [links](url).">
            <Row label="Summary" hint="One line shown under the title"><input className="m-input" value={form.summary} onChange={set('summary')} /></Row>
            <div className="m-row stack"><textarea className="m-textarea" rows={9} value={form.description} onChange={set('description')} /></div>
          </Section>

          <Section title="SEO & sharing">
            <Row label="SEO title" hint="Defaults to “{title} for Sale”"><input className="m-input" value={form.seoTitle} onChange={set('seoTitle')} /><Counter value={form.seoTitle} max={60} /></Row>
            <Row label="Meta description" hint="Defaults to the summary"><input className="m-input" value={form.seoDescription} onChange={set('seoDescription')} /><Counter value={form.seoDescription} max={160} /></Row>
            <div className="m-row stack">
              <span className="label" style={{ color: 'var(--m-text-2)', fontSize: 12 }}>Google preview</span>
              <SerpPreview title={form.seoTitle || `${form.title} for Sale`} description={ogDescription} path={path} />
            </div>
            <div className="m-row stack">
              <span className="label" style={{ color: 'var(--m-text-2)', fontSize: 12 }}>WhatsApp enquiry preview</span>
              <WhatsAppPreview image={form.images[0]} title={form.title} description={ogDescription} path={path} message={vehicleMessage({ name: form.title, category: cat?.name || '', url: absUrl(path) })} />
            </div>
          </Section>

          {!isNew && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button className="m-btn danger" onClick={() => remove(form.title)}>Delete vehicle</button>
              <button className="m-btn primary" onClick={() => save()} disabled={saving}>Save changes</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
