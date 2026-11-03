import Link from 'next/link';
import Img from '@/components/Img';
import PostCard, { PostMeta } from '@/components/blog/PostCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getPosts, getSettings } from '@/lib/db';
import { absUrl, postUrl } from '@/lib/site';
import { generalMessage } from '@/lib/whatsapp';

export const metadata = {
  title: 'Blog — Vintage Bikes, Scooters, Cars & Restoration',
  description: 'Buying guides, restoration stories and ownership tips for vintage bikes, vintage scooters and classic cars from the DreamWheels workshop.',
  // Tag-filtered views (?tag=) canonicalise to the main blog page.
  alternates: { canonical: '/blog/' },
};

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const tag = typeof sp.tag === 'string' ? sp.tag : '';
  const [all, settings] = await Promise.all([getPosts(), getSettings()]);

  const counts = {};
  all.forEach((p) => (p.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const tags = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const posts = tag ? all.filter((p) => p.tags?.includes(tag)) : all;
  const [lead, ...rest] = posts;

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>Blog</span></nav>
          <span className="kicker">Blog</span>
          <h1>Buying guides, restoration and history</h1>
          <p>Practical advice on buying and maintaining classic bikes, scooters and cars, plus notes from our workshop.</p>
          {tags.length > 0 && (
            <nav className="blog-tags" aria-label="Topics">
              <Link href="/blog/" className={`btag ${!tag ? 'on' : ''}`}>All stories <small>{all.length}</small></Link>
              {tags.map(([t, n]) => (
                <Link key={t} href={`/blog/?tag=${encodeURIComponent(t)}`} className={`btag ${tag === t ? 'on' : ''}`}>{t} <small>{n}</small></Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      <div className="wrap">
        {!lead ? (
          <div className="empty" style={{ marginTop: 40 }}>
            <h3>No stories here yet</h3>
            <Link href="/blog/" className="btn dark">See all stories</Link>
          </div>
        ) : (
          <>
            <Link href={postUrl(lead)} className="blog-feature">
              <div className="bf-media">
                <Img src={lead.cover} alt={lead.title} eager />
              </div>
              <div className="bf-body">
                <div className="bf-badges">
                  <span className="bf-new">{tag ? `Latest in ${tag}` : 'Latest story'}</span>
                  {lead.tags?.[0] && !tag && <span className="bcard-tag static">{lead.tags[0]}</span>}
                </div>
                <h2>{lead.title}</h2>
                {lead.excerpt && <p>{lead.excerpt}</p>}
                <PostMeta p={lead} />
                <span className="btn dark bf-cta">Read the story</span>
              </div>
            </Link>

            {rest.length > 0 && (
              <section className="blog-grid-wrap">
                <div className="head">
                  <div>
                    <span className="kicker">{tag ? `More in ${tag}` : 'More stories'}</span>
                    <h2>Latest articles</h2>
                  </div>
                </div>
                <div className="blog-grid">
                  {rest.map((p) => <PostCard key={p.id} p={p} />)}
                </div>
              </section>
            )}
          </>
        )}

        <section className="blog-cta">
          <div>
            <h2>Have a question about a classic?</h2>
            <p>Ask us about buying advice, parts or restoration — our team will get back to you.</p>
          </div>
          <div className="blog-cta-btns">
            <WhatsAppButton number={settings.whatsapp} message={generalMessage({ url: absUrl('/blog/'), source: 'Blog' })} lead={{ module: 'Website', itemName: 'Blog enquiry', category: '', pageUrl: absUrl('/blog/') }}>
              Chat on WhatsApp
            </WhatsAppButton>
            <Link href="/vintage-bikes/" className="btn ghost-light">Browse the collection</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
