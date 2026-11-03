'use client';
import { useEffect, useRef, useState } from 'react';
import { useShell } from './AdminShell';

/* ---------- data ---------- */
export async function api(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = '/admin/login/';
    throw new Error('Session expired');
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function useCollection(name) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const load = () =>
    api(`/api/admin/${name}/`)
      .then(setItems)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  return { items, setItems, error, reload: load };
}

/** Cmd/Ctrl+S to save, like a native app. */
export function useSaveShortcut(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/* ---------- chrome ---------- */
export function Toolbar({ title, sub, children }) {
  const shell = useShell();
  return (
    <header className="m-toolbar">
      <button className="m-btn plain icon m-menu" onClick={shell.openNav} aria-label="Open sidebar">☰</button>
      <div className="title">
        {title}
        {sub && <span className="sub">{sub}</span>}
      </div>
      <div className="spacer" />
      {children}
    </header>
  );
}

export function SearchField({ value, onChange, placeholder = 'Search' }) {
  return (
    <label className="m-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type="search" />
    </label>
  );
}

/* ---------- controls ---------- */
export function Toggle({ on, onChange, label }) {
  return <button type="button" role="switch" aria-checked={!!on} aria-label={label} className={`m-toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />;
}

export function Seg({ value, options, onChange }) {
  return (
    <div className="m-seg" role="radiogroup">
      {options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return (
          <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function Section({ title, hint, right, children }) {
  return (
    <>
      <div className="m-section-title">
        <span>{title}</span>
        {right && <small>{right}</small>}
      </div>
      <div className="m-group">{children}</div>
      {hint && <p className="m-hint">{hint}</p>}
    </>
  );
}

export function Row({ label, hint, stack, children }) {
  return (
    <div className={`m-row ${stack ? 'stack' : ''}`}>
      <label>
        {label}
        {hint && <small>{hint}</small>}
      </label>
      {stack ? children : <div className="ctl">{children}</div>}
    </div>
  );
}

const STATUS_COLORS = {
  new: 'blue', pending: 'orange', approved: 'green', rejected: 'red', contacted: 'purple', closed: 'gray', 'in-review': 'orange', quoted: 'purple',
  confirmed: 'blue', shipped: 'purple', delivered: 'green', cancelled: 'red',
  Available: 'green', Reserved: 'orange', Sold: 'red', live: 'green', draft: 'gray',
};
export function Pill({ status, children }) {
  return <span className={`m-pill ${STATUS_COLORS[status] || 'gray'}`}>{children || status}</span>;
}

export function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim().replace(/,$/, '');
    if (t && !value.includes(t)) onChange([...value, t]);
    setText('');
  };
  return (
    <div className="m-tags">
      {value.map((t) => (
        <span key={t}>
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}>×</button>
        </span>
      ))}
      <input
        value={text}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
      />
    </div>
  );
}

/** Upload, reorder (first = cover / OG image), remove, or paste URLs. */
export function MediaField({ value = [], onChange, multiple = true, label = 'Add photos' }) {
  const shell = useShell();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(files) {
    if (!files.length) return;
    setBusy(true);
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));
    try {
      const res = await fetch('/api/admin/upload/', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(multiple ? [...value, ...data.urls] : data.urls.slice(0, 1));
      shell.notify(`${data.urls.length} image${data.urls.length > 1 ? 's' : ''} uploaded`);
    } catch (e) {
      shell.notify(e.message, 'err');
    }
    setBusy(false);
  }

  function addUrl() {
    const url = window.prompt('Paste image URL');
    if (url && /^(https?:\/\/|\/)/.test(url)) onChange(multiple ? [...value, url] : [url]);
  }

  const move = (i, d) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="m-media" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}>
        {value.map((src, i) => (
          <div className="tile" key={src + i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" />
            {i === 0 && multiple && <span className="cover">Cover</span>}
            <div className="acts">
              {i > 0 && <button type="button" onClick={() => move(i, -1)} title="Move left">‹</button>}
              {i < value.length - 1 && <button type="button" onClick={() => move(i, 1)} title="Move right">›</button>}
              <button type="button" onClick={() => onChange(value.filter((_, n) => n !== i))} title="Remove">×</button>
            </div>
          </div>
        ))}
        {(multiple || value.length === 0) && (
          <button type="button" className="add" onClick={() => input.current?.click()} disabled={busy}>
            <span><b>{busy ? '…' : '+'}</b>{busy ? 'Uploading' : label}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      <button type="button" className="m-btn plain" style={{ marginTop: 6, color: 'var(--m-accent)', paddingLeft: 0 }} onClick={addUrl}>or paste an image URL</button>
    </div>
  );
}

export function Empty({ icon = '📭', title, children }) {
  return (
    <div className="m-empty">
      <div>
        <div className="big">{icon}</div>
        <b style={{ color: 'var(--m-text-2)' }}>{title}</b>
        {children && <div style={{ marginTop: 6 }}>{children}</div>}
      </div>
    </div>
  );
}

export function Counter({ value = '', max }) {
  return <span className={`m-counter ${value.length > max ? 'over' : ''}`}>{value.length}/{max}</span>;
}

const AVATAR_COLORS = ['#ff9f0a', '#30d158', '#0a84ff', '#bf5af2', '#ff375f', '#64d2ff', '#ac8e68'];
export function Avatar({ name = '?' }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  const color = AVATAR_COLORS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return <span className="m-avatar" style={{ background: color }}>{initials}</span>;
}
