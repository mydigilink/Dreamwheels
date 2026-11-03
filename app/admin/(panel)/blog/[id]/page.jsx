'use client';
import Link from 'next/link';
import { use } from 'react';
import { Toolbar, Section, Row, Toggle, MediaField, TagInput, Counter } from '@/components/admin/ui';
import { SerpPreview } from '@/components/admin/Previews';
import { useEditor } from '@/components/admin/useEditor';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { markdownToHtml } from '@/lib/markdown';
import { slugify } from '@/lib/site';

const BLANK = { title: '', slug: '', excerpt: '', cover: '', content: '', author: 'DreamWheels Team', tags: [], published: false };

// Older posts were written in Markdown — convert them once when opened in the visual editor.
const toEditorHtml = (s = '') => (/^\s*</.test(s) || !s ? s : markdownToHtml(s));

export default function PostEditor({ params }) {
  const { id } = use(params);
  const { form, set, save, remove, saving, dirty, isNew } = useEditor('posts', id, BLANK, '/admin/blog/');
  if (!form) return <><Toolbar title="Loading…" /><div className="m-content" /></>;

  const path = `/blog/${form.slug || slugify(form.title) || 'new-post'}/`;

  return (
    <>
      <Toolbar title={isNew ? 'New Post' : form.title || 'Untitled'} sub={dirty ? '— Edited' : ''}>
        {!isNew && form.published && <a className="m-btn m-hide-mobile" href={path} target="_blank" rel="noopener">View ↗</a>}
        <Link href="/admin/blog/" className="m-btn m-hide-mobile">Cancel</Link>
        {!form.published && <button className="m-btn" onClick={() => save({ published: true })} disabled={saving}>Publish</button>}
        <button className="m-btn primary" onClick={() => save()} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </Toolbar>
      <div className="m-content">
        <div className="m-page wide">
          <input
            value={form.title}
            onChange={set('title')}
            placeholder="Post title"
            style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', padding: '4px 0 12px' }}
          />
          <RichTextEditor key={form.id || 'new'} value={toEditorHtml(form.content)} onChange={set('content')} />

          <div className="m-page" style={{ marginTop: 8 }}>
            <Section title="Post settings">
              <Row label="Published"><Toggle on={form.published} onChange={set('published')} label="Published" /></Row>
              <Row label="URL slug"><input className="m-input" value={form.slug} onChange={(e) => set('slug')(slugify(e.target.value))} placeholder={slugify(form.title)} /></Row>
              <Row label="Author"><input className="m-input" value={form.author} onChange={set('author')} /></Row>
              <Row label="Tags"><TagInput value={form.tags} onChange={set('tags')} placeholder="restoration" /></Row>
              <Row label="Excerpt" hint="Used in listings and as meta description"><input className="m-input" value={form.excerpt} onChange={set('excerpt')} /><Counter value={form.excerpt} max={160} /></Row>
            </Section>
            <Section title="Cover image">
              <div className="m-row stack"><MediaField value={form.cover ? [form.cover] : []} onChange={(v) => set('cover')(v[0] || '')} multiple={false} label="Add cover" /></div>
            </Section>
            <Section title="Search preview">
              <div className="m-row stack"><SerpPreview title={form.title} description={form.excerpt} path={path} /></div>
            </Section>
            {!isNew && <div style={{ marginTop: 24 }}><button className="m-btn danger" onClick={() => remove(form.title)}>Delete post</button></div>}
          </div>
        </div>
      </div>
    </>
  );
}
