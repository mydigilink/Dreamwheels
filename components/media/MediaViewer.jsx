'use client';
import { useRef, useState } from 'react';
import Img from '../Img';
import Spin360 from './Spin360';
import VideoEmbed from './VideoEmbed';

/** Photos / Video / 360° switcher for single vehicle and product pages. */
export default function MediaViewer({ images = [], video, spin = [], title, videoFallback }) {
  const tabs = [
    { key: 'photos', label: `Photos (${images.length})`, show: images.length > 0 },
    { key: 'video', label: '▶ Video', show: !!video || !!videoFallback },
    { key: '360', label: '360° View', show: spin.length >= 8 },
  ].filter((t) => t.show);
  const [tab, setTab] = useState(tabs[0]?.key || 'photos');
  const [i, setI] = useState(0);
  const touch = useRef(null);

  const go = (d) => setI((n) => (n + d + images.length) % images.length);
  const onTouchStart = (e) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  return (
    <div className="gallery">
      {tabs.length > 1 && (
        <div className="media-tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t.key} role="tab" className="chip" aria-pressed={tab === t.key} aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'photos' && (
        <>
          <div className="main" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <Img src={images[i]} alt={`${title} — photo ${i + 1}`} eager={i === 0} />
            {images.length > 1 && (
              <>
                <span className="counter">{i + 1} / {images.length}</span>
                <div className="nav-arrows">
                  <button onClick={() => go(-1)} aria-label="Previous photo">‹</button>
                  <button onClick={() => go(1)} aria-label="Next photo">›</button>
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((src, n) => (
                <button key={src + n} className={n === i ? 'active' : ''} onClick={() => setI(n)} aria-label={`Show photo ${n + 1}`}>
                  <Img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'video' && (video ? <VideoEmbed url={video} title={`${title} video`} /> : videoFallback)}
      {tab === '360' && <Spin360 frames={spin} alt={title} />}
    </div>
  );
}
