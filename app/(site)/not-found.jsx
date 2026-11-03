import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap section" style={{ textAlign: 'center' }}>
      <span className="kicker">Error 404</span>
      <h1 style={{ margin: '12px 0' }}>Page not found</h1>
      <p className="muted">The page you’re looking for has moved or no longer exists.</p>
      <div className="hero-ctas" style={{ justifyContent: 'center', marginTop: 20 }}>
        <Link href="/vintage-bikes/" className="btn dark">Browse the collection</Link>
        <Link href="/spare-parts/" className="btn">Shop spare parts</Link>
      </div>
    </div>
  );
}
