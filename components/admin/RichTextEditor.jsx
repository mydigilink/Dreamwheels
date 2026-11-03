'use client';
import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Youtube from '@tiptap/extension-youtube';
import { TableKit } from '@tiptap/extension-table';
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style';
import { Placeholder, CharacterCount } from '@tiptap/extensions';
import { useShell } from './AdminShell';

/* ---------- icons (16px, stroke) ---------- */
const P = {
  undo: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  redo: 'm15 14 5-5-5-5M20 9H9a5 5 0 0 0 0 10h3',
  bold: 'M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z',
  italic: 'M19 4h-9M14 20H5M15 4 9 20',
  underline: 'M6 4v6a6 6 0 0 0 12 0V4M4 21h16',
  strike: 'M16 6c-.8-1.3-2.3-2-4-2-2.5 0-4.5 1.3-4.5 3.5 0 4.5 9 2.5 9 7 0 2.2-2 3.5-4.5 3.5-1.9 0-3.5-.8-4.3-2.3M4 12h16',
  code: 'm8 7-5 5 5 5M16 7l5 5-5 5',
  left: 'M4 6h16M4 10h10M4 14h16M4 18h10',
  center: 'M4 6h16M7 10h10M4 14h16M7 18h10',
  right: 'M4 6h16M10 10h10M4 14h16M10 18h10',
  justify: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  ul: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  ol: 'M10 6h10M10 12h10M10 18h10M4 5h1v4M4 9h2M4 15.5c0-.8 2-1 2 0 0 .8-2 1.6-2 2.5h2',
  quote: 'M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6',
  codeblock: 'M4 4h16v16H4zM9 9l-2 3 2 3M15 9l2 3-2 3',
  hr: 'M3 12h18',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01',
  video: 'M3 6h18v12H3zM10 9.5v5l4.5-2.5z',
  table: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14M15 5v14',
  clear: 'M6 5h12M12 5 8 19M15 15l5 5M20 15l-5 5',
  source: 'm8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
  full: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  color: 'M5 19 12 4l7 15M8 13h8',
  marker: 'M15 5l4 4-9 9H6v-4zM4 21h16',
  break: 'M4 7h12a4 4 0 0 1 0 8H8m0 0 3-3m-3 3 3 3',
};
const Icon = ({ name }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={P[name]} />
  </svg>
);

const COLORS = ['#1b1a17', '#4f241f', '#b2894f', '#777063', '#d12d24', '#e8590c', '#2f7a4b', '#0a84ff', '#7048e8', '#ffffff'];
const HIGHLIGHTS = ['#fff3bf', '#ffe8cc', '#d3f9d8', '#d0ebff', '#f3d9fa', '#ffe3e3', '#eae0d0'];
const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'];

function Btn({ icon, label, onClick, active, disabled, children }) {
  return (
    <button
      type="button"
      className={`rte-btn ${active ? 'on' : ''}`}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

/** Small anchored popover; closes on outside click / Escape. */
function Pop({ icon, label, active, children, swatch }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div className="rte-pop-wrap" ref={ref}>
      <button type="button" className={`rte-btn ${active || open ? 'on' : ''}`} title={label} aria-label={label} aria-expanded={open} onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen((o) => !o)}>
        <Icon name={icon} />
        {swatch !== undefined && <span className="rte-swatch-bar" style={{ background: swatch || 'transparent' }} />}
        <span className="rte-caret">▾</span>
      </button>
      {open && <div className="rte-pop">{children(() => setOpen(false))}</div>}
    </div>
  );
}

async function uploadFiles(files) {
  const fd = new FormData();
  [...files].forEach((f) => fd.append('files', f));
  const res = await fetch('/api/admin/upload/', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.urls;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing your story…' }) {
  const shell = useShell();
  const [source, setSource] = useState(false);
  const [html, setHtml] = useState(value || '');
  const [full, setFull] = useState(false);
  const fileInput = useRef(null);
  const editorRef = useRef(null);

  const insertUploaded = async (files, view, pos) => {
    const images = [...files].filter((f) => f.type.startsWith('image/'));
    if (!images.length) return false;
    try {
      shell.notify('Uploading image…');
      const urls = await uploadFiles(images);
      const ed = editorRef.current;
      const chain = ed.chain().focus();
      if (pos != null) chain.setTextSelection(pos);
      urls.forEach((src) => chain.setImage({ src, alt: '' }));
      chain.run();
      shell.notify(`${urls.length} image${urls.length > 1 ? 's' : ''} added`);
    } catch (e) {
      shell.notify(e.message, 'err');
    }
    return true;
  };

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] }, link: { openOnClick: false, autolink: true, defaultProtocol: 'https' } }),
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Youtube.configure({ nocookie: true, modestBranding: true, width: 640, height: 360 }),
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || '',
    editorProps: {
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false;
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        event.preventDefault();
        insertUploaded(event.dataTransfer.files, view, pos);
        return true;
      },
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files;
        if (!files?.length) return false;
        event.preventDefault();
        insertUploaded(files, view);
        return true;
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.isEmpty ? '' : ed.getHTML()),
  });
  editorRef.current = editor;

  useEffect(() => {
    document.body.style.overflow = full ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [full]);

  if (!editor) return <div className="rte"><div className="rte-loading">Loading editor…</div></div>;

  const c = () => editor.chain().focus();
  const block = editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'p';
  const setBlock = (v) => (v === 'p' ? c().setParagraph().run() : c().toggleHeading({ level: Number(v[1]) }).run());
  const currentColor = editor.getAttributes('textStyle').color;
  const currentSize = editor.getAttributes('textStyle').fontSize || '';
  const inTable = editor.isActive('table');

  function toggleSource() {
    if (source) {
      editor.commands.setContent(html, { emitUpdate: true });
    } else {
      setHtml(editor.getHTML());
    }
    setSource(!source);
  }

  return (
    <div className={`rte ${full ? 'full' : ''}`}>
      <div className="rte-bar" role="toolbar" aria-label="Formatting">
        <div className="rte-group">
          <Btn icon="undo" label="Undo (⌘Z)" onClick={() => c().undo().run()} disabled={source || !editor.can().undo()} />
          <Btn icon="redo" label="Redo (⇧⌘Z)" onClick={() => c().redo().run()} disabled={source || !editor.can().redo()} />
        </div>
        <div className="rte-group">
          <select className="rte-select" value={block} onChange={(e) => setBlock(e.target.value)} disabled={source} aria-label="Text style">
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <select className="rte-select narrow" value={currentSize} onChange={(e) => (e.target.value ? c().setFontSize(e.target.value).run() : c().unsetFontSize().run())} disabled={source} aria-label="Font size">
            <option value="">Size</option>
            {SIZES.map((s) => <option key={s} value={s}>{parseInt(s, 10)}</option>)}
          </select>
        </div>
        <div className="rte-group">
          <Btn icon="bold" label="Bold (⌘B)" active={editor.isActive('bold')} onClick={() => c().toggleBold().run()} disabled={source} />
          <Btn icon="italic" label="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => c().toggleItalic().run()} disabled={source} />
          <Btn icon="underline" label="Underline (⌘U)" active={editor.isActive('underline')} onClick={() => c().toggleUnderline().run()} disabled={source} />
          <Btn icon="strike" label="Strikethrough" active={editor.isActive('strike')} onClick={() => c().toggleStrike().run()} disabled={source} />
          <Btn icon="code" label="Inline code" active={editor.isActive('code')} onClick={() => c().toggleCode().run()} disabled={source} />
        </div>
        {!source && (
          <div className="rte-group">
            <Pop icon="color" label="Text colour" swatch={currentColor || '#1b1a17'}>
              {(close) => (
                <div className="rte-swatches">
                  {COLORS.map((col) => <button key={col} type="button" style={{ background: col }} title={col} onClick={() => { c().setColor(col).run(); close(); }} />)}
                  <label className="rte-custom" title="Custom colour"><input type="color" onChange={(e) => c().setColor(e.target.value).run()} />+</label>
                  <button type="button" className="rte-reset" onClick={() => { c().unsetColor().run(); close(); }}>Default</button>
                </div>
              )}
            </Pop>
            <Pop icon="marker" label="Highlight" active={editor.isActive('highlight')} swatch={editor.getAttributes('highlight').color || ''}>
              {(close) => (
                <div className="rte-swatches">
                  {HIGHLIGHTS.map((col) => <button key={col} type="button" style={{ background: col }} title={col} onClick={() => { c().setHighlight({ color: col }).run(); close(); }} />)}
                  <button type="button" className="rte-reset" onClick={() => { c().unsetHighlight().run(); close(); }}>None</button>
                </div>
              )}
            </Pop>
          </div>
        )}
        <div className="rte-group">
          {['left', 'center', 'right', 'justify'].map((a) => (
            <Btn key={a} icon={a} label={`Align ${a}`} active={editor.isActive({ textAlign: a })} onClick={() => c().setTextAlign(a).run()} disabled={source} />
          ))}
        </div>
        <div className="rte-group">
          <Btn icon="ul" label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => c().toggleBulletList().run()} disabled={source} />
          <Btn icon="ol" label="Numbered list" active={editor.isActive('orderedList')} onClick={() => c().toggleOrderedList().run()} disabled={source} />
          <Btn icon="quote" label="Quote" active={editor.isActive('blockquote')} onClick={() => c().toggleBlockquote().run()} disabled={source} />
          <Btn icon="codeblock" label="Code block" active={editor.isActive('codeBlock')} onClick={() => c().toggleCodeBlock().run()} disabled={source} />
          <Btn icon="hr" label="Divider" onClick={() => c().setHorizontalRule().run()} disabled={source} />
          <Btn icon="break" label="Line break (⇧↵)" onClick={() => c().setHardBreak().run()} disabled={source} />
        </div>
        {!source && (
          <div className="rte-group">
            <Pop icon="link" label="Link" active={editor.isActive('link')}>
              {(close) => <LinkForm editor={editor} close={close} />}
            </Pop>
            <Pop icon="image" label="Image">
              {(close) => <ImageForm editor={editor} close={close} onUpload={() => { close(); fileInput.current?.click(); }} />}
            </Pop>
            <Pop icon="video" label="YouTube video">
              {(close) => <VideoForm editor={editor} close={close} />}
            </Pop>
            <Btn icon="table" label="Insert table" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={inTable} />
          </div>
        )}
        <div className="rte-group">
          <Btn icon="clear" label="Clear formatting" onClick={() => c().unsetAllMarks().clearNodes().run()} disabled={source} />
          <Btn icon="source" label={source ? 'Back to visual editor' : 'Edit HTML source'} active={source} onClick={toggleSource} />
          <Btn icon="full" label={full ? 'Exit full screen' : 'Full screen'} active={full} onClick={() => setFull(!full)} />
        </div>
      </div>

      {inTable && !source && (
        <div className="rte-bar sub" role="toolbar" aria-label="Table">
          <span className="rte-sub-label">Table</span>
          <Btn label="Row above" onClick={() => c().addRowBefore().run()}>+ Row ↑</Btn>
          <Btn label="Row below" onClick={() => c().addRowAfter().run()}>+ Row ↓</Btn>
          <Btn label="Column left" onClick={() => c().addColumnBefore().run()}>+ Col ←</Btn>
          <Btn label="Column right" onClick={() => c().addColumnAfter().run()}>+ Col →</Btn>
          <Btn label="Delete row" onClick={() => c().deleteRow().run()}>− Row</Btn>
          <Btn label="Delete column" onClick={() => c().deleteColumn().run()}>− Col</Btn>
          <Btn label="Merge cells" onClick={() => c().mergeCells().run()} disabled={!editor.can().mergeCells()}>Merge</Btn>
          <Btn label="Split cell" onClick={() => c().splitCell().run()} disabled={!editor.can().splitCell()}>Split</Btn>
          <Btn label="Toggle header row" onClick={() => c().toggleHeaderRow().run()}>Header</Btn>
          <Btn label="Delete table" onClick={() => c().deleteTable().run()}><span style={{ color: 'var(--m-red)' }}>Delete table</span></Btn>
        </div>
      )}

      {source ? (
        <textarea
          className="rte-source"
          value={html}
          spellCheck={false}
          onChange={(e) => {
            setHtml(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : (
        <EditorContent editor={editor} className="rte-body" />
      )}

      <div className="rte-status">
        <span>{editor.storage.characterCount.words()} words · {editor.storage.characterCount.characters()} characters · ~{Math.max(1, Math.round(editor.storage.characterCount.words() / 200))} min read</span>
        <span className="m-hide-mobile">Drag & drop or paste images to upload</span>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          insertUploaded(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

function LinkForm({ editor, close }) {
  const existing = editor.getAttributes('link');
  const [href, setHref] = useState(existing.href || '');
  const [blank, setBlank] = useState(existing.target === '_blank');
  const apply = (e) => {
    e.preventDefault();
    if (!href) return;
    const url = /^(https?:|mailto:|tel:|\/|#)/.test(href) ? href : `https://${href}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: blank ? '_blank' : null, rel: blank ? 'noopener' : null }).run();
    close();
  };
  return (
    <form className="rte-form" onSubmit={apply}>
      <label>Link URL</label>
      <input className="m-input" autoFocus value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://… or /vintage-bikes/" />
      <label className="m-check"><input type="checkbox" checked={blank} onChange={(e) => setBlank(e.target.checked)} /> Open in new tab</label>
      <div className="rte-form-acts">
        {existing.href && <button type="button" className="m-btn danger" onClick={() => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); close(); }}>Remove</button>}
        <button className="m-btn primary">Apply</button>
      </div>
    </form>
  );
}

function ImageForm({ editor, close, onUpload }) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const insert = (e) => {
    e.preventDefault();
    if (!/^(https?:\/\/|\/)/.test(src)) return;
    editor.chain().focus().setImage({ src, alt }).run();
    close();
  };
  return (
    <form className="rte-form" onSubmit={insert}>
      <button type="button" className="m-btn primary" style={{ width: '100%' }} onClick={onUpload}>Upload from computer…</button>
      <div className="rte-or">or insert from URL</div>
      <input className="m-input" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://…/photo.jpg" />
      <input className="m-input" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (describe the image for SEO)" />
      <div className="rte-form-acts"><button className="m-btn" disabled={!src}>Insert</button></div>
    </form>
  );
}

function VideoForm({ editor, close }) {
  const [src, setSrc] = useState('');
  const [err, setErr] = useState('');
  const insert = (e) => {
    e.preventDefault();
    const ok = editor.chain().focus().setYoutubeVideo({ src }).run();
    if (!ok) return setErr('Paste a valid YouTube link.');
    close();
  };
  return (
    <form className="rte-form" onSubmit={insert}>
      <label>YouTube URL</label>
      <input className="m-input" autoFocus value={src} onChange={(e) => { setSrc(e.target.value); setErr(''); }} placeholder="https://youtube.com/watch?v=…" />
      {err && <small style={{ color: 'var(--m-red)' }}>{err}</small>}
      <div className="rte-form-acts"><button className="m-btn primary" disabled={!src}>Embed</button></div>
    </form>
  );
}
