'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toolbar, Section, Row, Seg, MediaField, api, useSaveShortcut } from '@/components/admin/ui';
import { useShell } from '@/components/admin/AdminShell';
import { slugify } from '@/lib/site';

export default function CategoriesPage() {
  const shell = useShell();
  const router = useRouter();
  const [cats, setCats] = useState(null);
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/api/admin/config/categories/').then(setCats).catch((e) => shell.notify(e.message, 'err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    try {
      setCats(await api('/api/admin/config/categories/', { method: 'PUT', body: cats }));
      shell.notify('Categories saved');
      router.refresh();
    } catch (e) {
      shell.notify(e.message, 'err');
    }
    setSaving(false);
  }
  useSaveShortcut(save);

  if (!cats) return <><Toolbar title="Categories" /><div className="m-content" /></>;
  const c = cats[active];
  const setC = (k) => (e) => setCats((all) => all.map((x, i) => (i === active ? { ...x, [k]: e?.target ? e.target.value : e } : x)));
  const setSub = (n, k) => (e) => setC('subcategories')(c.subcategories.map((s, i) => (i === n ? { ...s, [k]: e?.target ? e.target.value : e } : s)));

  return (
    <>
      <Toolbar title="Categories" sub="Marketplace structure">
        <button className="m-btn primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </Toolbar>
      <div className="m-content">
        <div className="m-page">
          <Seg value={active} onChange={setActive} options={cats.map((x, i) => [i, x.name])} />
          <p className="m-hint">Main category URLs (<b>/{c.slug}/</b>) are fixed to protect SEO. Sub-categories get their own page at <b>/{c.slug}/&lt;sub-slug&gt;/</b>.</p>

          <Section title="Category page">
            <Row label="Name"><input className="m-input" value={c.name} onChange={setC('name')} /></Row>
            <Row label="Label" hint="Short label, e.g. Scooter"><input className="m-input" value={c.label || ''} onChange={setC('label')} /></Row>
            <Row label="Kicker"><input className="m-input" value={c.kicker || ''} onChange={setC('kicker')} /></Row>
            <Row label="Page heading (H1)" hint="Unique per category"><input className="m-input" value={c.h1 || ''} onChange={setC('h1')} /></Row>
            <Row label="Intro text" hint="SEO intro under the heading" stack><textarea className="m-textarea" value={c.intro || ''} onChange={setC('intro')} /></Row>
            <Row label="Tile image" stack><MediaField value={c.image ? [c.image] : []} onChange={(v) => setC('image')(v[0] || '')} multiple={false} label="Add image" /></Row>
          </Section>

          <Section
            title="Sub-categories"
            right={<button className="m-btn plain" style={{ color: 'var(--m-accent)' }} onClick={() => setC('subcategories')([...c.subcategories, { name: '', slug: '', type: 'brand', intro: '' }])}>+ Add sub-category</button>}
            hint="Assign vehicles to sub-categories from the vehicle editor."
          >
            {c.subcategories.length === 0 && <div className="m-row"><span style={{ color: 'var(--m-text-2)' }}>No sub-categories yet.</span></div>}
            {c.subcategories.map((s, n) => (
              <div className="m-row stack" key={n}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input className="m-input" style={{ flex: '1 1 160px' }} value={s.name} placeholder="Name" onChange={(e) => setC('subcategories')(c.subcategories.map((x, i) => (i === n ? { ...x, name: e.target.value, slug: x.slug || '' } : x)))} />
                  <input className="m-input" style={{ flex: '1 1 140px' }} value={s.slug} placeholder={slugify(s.name) || 'url-slug'} onChange={(e) => setSub(n, 'slug')(slugify(e.target.value))} />
                  <Seg value={s.type} onChange={setSub(n, 'type')} options={[['brand', 'Brand'], ['era', 'Era'], ['condition', 'Condition']]} />
                  <button className="m-btn plain icon" onClick={() => setC('subcategories')(c.subcategories.filter((_, i) => i !== n))} aria-label="Remove">⊖</button>
                </div>
                <input className="m-input" value={s.intro} placeholder="Intro text for this sub-category page" onChange={setSub(n, 'intro')} />
              </div>
            ))}
          </Section>
        </div>
      </div>
    </>
  );
}
