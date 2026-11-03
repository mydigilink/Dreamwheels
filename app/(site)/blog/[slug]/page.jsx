import Link from 'next/link';
import { notFound } from 'next/navigation';
import Img from '@/components/Img';
import PostCard, { PostMeta, initials } from '@/components/blog/PostCard';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ShareButtons from '@/components/blog/ShareButtons';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getPost, getPosts, getSettings } from '@/lib/db';
import { absUrl, postUrl } from '@/lib/site';
import { readingMinutes, renderPostHtml, withHeadingIds } from '@/lib/content';
import { generalMessage } from '@/lib/whatsapp';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: postUrl(p) },
    openGraph: { type: 'article', title: p.title, description: p.excerpt, url: postUrl(p), publishedTime: p.createdAt, images: p.cover ? [p.cover] : undefined },
    twitter: { card: 'summary_large_image', title: p.title, description: p.excerpt, images: p.cover ? [p.cover] : undefined },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const [p, all, settings] = await Promise.all([getPost(slug), getPosts(), getSettings()]);
  if (!p) notFound();

  const url = absUrl(postUrl(p));
  const { html, toc } = withHeadingIds(renderPostHtml(p.content));
  const idx = all.findIndex((x) => x.id === p.id);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const related = all
    .filter((x) => x.id !== p.id)
    .sort((a, b) => (b.tags || []).filter((t) => p.tags?.includes(t)).length - (a.tags || []).filter((t) => p.tags?.includes(t)).length)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt,
    image: p.cover,
    datePublished: p.createdAt,
    dateModified: p.updatedAt || p.createdAt,
    author: { '@type': 'Organization', name: p.author || 'DreamWheels' },
    publisher: { '@type': 'Organization', name: 'DreamWheels' },
    mainEntityOfPage: url,
  };

  return (
    <article className="post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      <header className="post-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span><Link href="/blog/">Blog</Link></span>
            <span>{p.tags?.[0] || 'Article'}</span>
          </nav>
          <div className="post-head-inner">
            {p.tags?.length > 0 && (
              <div className="post-head-tags">
                {p.tags.map((t) => <Link key={t} href={`/blog/?tag=${encodeURIComponent(t)}`} className="ptag">{t}</Link>)}
              </div>
            )}
            <h1>{p.title}</h1>
            {p.excerpt && <p className="post-dek">{p.excerpt}</p>}
            <div className="post-head-meta">
              <PostMeta p={p} />
              <ShareButtons url={url} title={p.title} compact />
            </div>
          </div>
        </div>
      </header>

      {p.cover && (
        <div className="wrap">
          <figure className="post-cover">
            <Img src={p.cover} alt={p.title} eager />
          </figure>
        </div>
      )}

      <div className="wrap post-layout">
        {toc.length > 1 && (
          <aside className="post-aside">
            <div className="post-aside-inner">
              <nav className="toc" aria-label="In this article">
                <span className="toc-title">In this article</span>
                <ol>
                  {toc.map((h, n) => (
                    <li key={h.id} className={h.level === 3 ? 'sub' : ''}><a href={`#${h.id}`}><i>{String(n + 1).padStart(2, '0')}</i>{h.text}</a></li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>
        )}

        <div className="post-main">
          {toc.length > 1 && (
            <details className="toc-mobile">
              <summary>In this article · {toc.length} sections</summary>
              <ol>{toc.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
            </details>
          )}
          <div className="article-body prose dropcap" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="post-end">
            <ShareButtons url={url} title={p.title} />
            {p.tags?.length > 0 && (
              <div className="post-end-tags">
                {p.tags.map((t) => <Link key={t} href={`/blog/?tag=${encodeURIComponent(t)}`} className="chip">#{t}</Link>)}
              </div>
            )}
          </div>

          <div className="author-box">
            <span className="pm-avatar lg">{initials(p.author)}</span>
            <div>
              <small>Written by</small>
              <b>{p.author || 'DreamWheels'}</b>
              <p>Specialists in classic and vintage motorcycles, scooters and cars — buying, restoring and keeping them on the road. {readingMinutes(p.content)} min read.</p>
              <WhatsAppButton
                number={settings.whatsapp}
                className="btn wa sm"
                message={generalMessage({ url, source: 'Blog article' })}
                lead={{ module: 'Website', itemName: `Blog: ${p.title}`, category: 'Blog', pageUrl: url }}
              >
                Ask us about this
              </WhatsAppButton>
            </div>
          </div>

          {(newer || older) && (
            <nav className={`post-nav ${older && newer ? '' : 'single'}`} aria-label="More articles">
              {older && (
                <Link href={postUrl(older)} className="pn prev"><small>Previous article</small><b>{older.title}</b></Link>
              )}
              {newer && (
                <Link href={postUrl(newer)} className="pn next"><small>Next article</small><b>{newer.title}</b></Link>
              )}
            </nav>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="post-related">
          <div className="wrap">
            <div className="head">
              <div>
                <h2>More articles</h2>
              </div>
              <Link href="/blog/" className="btn">All stories</Link>
            </div>
            <div className="blog-grid">
              {related.map((x) => <PostCard key={x.id} p={x} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
