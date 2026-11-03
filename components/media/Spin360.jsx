'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Drag-to-rotate 360° viewer built from an ordered frame sequence (ideally 24–72 photos
 * taken on a turntable). No library needed; frames are preloaded after first paint.
 */
export default function Spin360({ frames, alt }) {
  const [i, setI] = useState(0);
  const [touched, setTouched] = useState(false);
  const drag = useRef(null);
  const box = useRef(null);

  useEffect(() => {
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [frames]);

  const onDown = (e) => {
    drag.current = { x: e.clientX, i };
    setTouched(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const width = box.current?.offsetWidth || 400;
    const step = width / frames.length / 1.2;
    const delta = Math.round((e.clientX - drag.current.x) / step);
    setI((((drag.current.i - delta) % frames.length) + frames.length) % frames.length);
  };
  const onUp = () => (drag.current = null);
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') setI((n) => (n - 1 + frames.length) % frames.length);
    if (e.key === 'ArrowRight') setI((n) => (n + 1) % frames.length);
  };

  return (
    <div
      ref={box}
      className="spin360"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
      tabIndex={0}
      role="img"
      aria-label={`${alt} — 360° view, drag or use arrow keys to rotate`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frames[i]} alt="" draggable={false} />
      {!touched && <span className="hint">⟲ Drag to rotate 360°</span>}
    </div>
  );
}
