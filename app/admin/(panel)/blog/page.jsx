'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Toolbar, SearchField, Pill, Empty, useCollection } from '@/components/admin/ui';
import { formatDate } from '@/lib/site';

export default function BlogAdmin() {
  const router = useRouter();
  const { items } = useCollection('posts');
  const [q, setQ] = useState('');
  const list = useMemo(() => (items || []).filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase())), [items, q]);

  return (
    <>
      <Toolbar title="Blog" sub={items ? `${items.length} posts` : ''}>
        <SearchField value={q} onChange={setQ} placeholder="Search posts" />
        <Link href="/admin/blog/new/" className="m-btn primary">✎ <span className="m-hide-mobile">New Post</span></Link>
      </Toolbar>
      <div className="m-content">
        {items && list.length === 0 ? (
          <Empty icon="✎" title="No posts yet"><Link href="/admin/blog/new/" className="m-btn primary">Write your first post</Link></Empty>
        ) : (
          <div className="m-tablewrap">
            <table className="m-table">
              <thead><tr><th style={{ width: 60 }}></th><th>Title</th><th className="m-hide-mobile">Author</th><th className="m-hide-mobile">Date</th><th>Status</th></tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="click" onClick={() => router.push(`/admin/blog/${p.id}/`)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <td><img className="thumb" src={p.cover || ''} alt="" /></td>
                    <td><div className="t">{p.title}</div><div className="s">{p.excerpt}</div></td>
                    <td className="m-hide-mobile s">{p.author}</td>
                    <td className="m-hide-mobile s">{formatDate(p.createdAt)}</td>
                    <td><Pill status={p.published ? 'live' : 'draft'}>{p.published ? 'Published' : 'Draft'}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
