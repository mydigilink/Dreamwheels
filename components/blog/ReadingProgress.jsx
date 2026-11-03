'use client';
import { useEffect, useState } from 'react';

/** Thin gold bar at the top of the viewport showing progress through the article. */
export default function ReadingProgress({ target = '.article-body' }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = document.querySelector(target);
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
    };
    const onScroll = () => !raf && (raf = requestAnimationFrame(update));
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [target]);
  return <div className="read-progress" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />;
}
