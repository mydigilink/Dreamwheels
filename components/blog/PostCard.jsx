import Link from 'next/link';
import Img from '../Img';
import { formatDate, postUrl } from '@/lib/site';
import { readingMinutes } from '@/lib/content';

export const initials = (name = 'DreamWheels') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export function PostMeta({ p, light = false }) {
  return (
    <div className={`post-meta ${light ? 'light' : ''}`}>
      <span className="pm-avatar">{initials(p.author)}</span>
      <span><b>{p.author || 'DreamWheels'}</b><small>{formatDate(p.createdAt)} · {readingMinutes(p.content)} min read</small></span>
    </div>
  );
}

export default function PostCard({ p, eager = false }) {
  return (
    <Link href={postUrl(p)} className="bcard">
      <div className="bcard-media">
        <Img src={p.cover} alt={p.title} eager={eager} />
        {p.tags?.[0] && <span className="bcard-tag">{p.tags[0]}</span>}
      </div>
      <div className="bcard-body">
        <h3>{p.title}</h3>
        {p.excerpt && <p>{p.excerpt}</p>}
        <div className="bcard-foot">
          <PostMeta p={p} />
          <span className="bcard-arrow" aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
