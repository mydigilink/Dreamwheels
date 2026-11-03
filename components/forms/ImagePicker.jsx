'use client';
import { useEffect, useRef, useState } from 'react';
import { CameraIcon } from '../Icons';

/** Mobile-friendly photo picker with previews and client-side count/size limits (server re-validates). */
export default function ImagePicker({ files, onChange, max = 6, maxMb = 8, label = 'Add photos' }) {
  const input = useRef(null);
  const [error, setError] = useState('');
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => next.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function add(list) {
    setError('');
    const picked = [...list].filter((f) => {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
        setError('Only JPG, PNG or WebP photos are allowed.');
        return false;
      }
      if (f.size > maxMb * 1024 * 1024) {
        setError(`${f.name} is larger than ${maxMb} MB.`);
        return false;
      }
      return true;
    });
    const all = [...files, ...picked];
    if (all.length > max) setError(`You can add up to ${max} photos.`);
    onChange(all.slice(0, max));
  }

  return (
    <div className="field">
      <span className="label">{label} <span className="req">*</span></span>
      <div
        className="dropzone"
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          add(e.dataTransfer.files);
        }}
      >
        <CameraIcon width={26} height={26} style={{ color: 'var(--muted)' }} />
        <b>Tap to add photos</b>
        <small>Up to {max} photos · JPG, PNG or WebP · max {maxMb} MB each</small>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          add(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <div className="notice error">{error}</div>}
      {files.length > 0 && (
        <div className="preview-grid">
          {urls.map((u, i) => (
            <div className="p" key={u}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Photo ${i + 1}`} />
              <button type="button" onClick={() => onChange(files.filter((_, n) => n !== i))} aria-label={`Remove photo ${i + 1}`}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
