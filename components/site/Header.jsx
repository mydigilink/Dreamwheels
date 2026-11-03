'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { CartIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon, ChevronIcon } from '../Icons';
import VehicleSearch from '../search/VehicleSearch';
import TopBar from './TopBar';

const LINKS = [
  { href: '/vintage-bikes/', label: 'Vintage Bikes', match: ['/vintage-bikes', '/vintage-scooters', '/vintage-cars', '/sports-bikes'] },
  { href: '/spare-parts/', label: 'Spare Parts' },
  { href: '/restoration/', label: 'Restoration' },
  { href: '/sell-your-bike/', label: 'Sell Your Vehicle' },
  { href: '/blog/', label: 'Blog' },
  { href: '/contact/', label: 'Contact' },
];

export default function Header({ settings, categories, locations = [], user = null }) {
  const pathname = usePathname();
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menu || search ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [menu, search]);
  useEffect(() => {
    if (!search) return;
    const onKey = (e) => e.key === 'Escape' && setSearch(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [search]);

  const isActive = (l) => (l.match || [l.href.replace(/\/$/, '')]).some((m) => pathname.startsWith(m));

  return (
    <>
      <TopBar settings={settings} />
      <header className="site-header">
        <div className="wrap nav">
          <Link className="logo-img" href="/" aria-label="DreamWheels home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="DreamWheels" width="603" height="160" fetchPriority="high" />
          </Link>
          <nav className="nav-links" aria-label="Main">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={isActive(l) ? 'active' : ''}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="btn dark desktop sm" href="/sell-your-bike/">
              Sell Vehicle
            </Link>
            <button className="icon-btn" onClick={() => setSearch(true)} aria-label="Search" aria-expanded={search}>
              <SearchIcon />
            </button>
            <Link className={`icon-btn${user ? ' signed-in' : ''}`} href={user ? '/account/' : '/login/'} aria-label={user ? `My account (${user.name})` : 'Sign in'} title={user ? user.name : 'Sign in'}>
              <UserIcon />
            </Link>
            <button className="icon-btn" onClick={() => cart.setOpen(true)} aria-label={`Cart, ${cart.count} items`}>
              <CartIcon />
              {cart.count > 0 && <span className="count">{cart.count}</span>}
            </button>
            <button className="icon-btn menu-btn" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {search && (
        <>
          <div className="drawer-backdrop" onClick={() => setSearch(false)} />
          <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search">
            <div className="wrap">
              <div className="search-panel-head">
                <span className="kicker">Search vehicles</span>
                <button className="icon-btn" onClick={() => setSearch(false)} aria-label="Close search"><CloseIcon /></button>
              </div>
              <VehicleSearch categories={categories} locations={locations} onDone={() => setSearch(false)} autoFocus />
            </div>
          </div>
        </>
      )}

      {menu && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="top">
            <Link className="logo-img" href="/" aria-label="DreamWheels home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="DreamWheels" width="603" height="160" />
            </Link>
            <button className="icon-btn" onClick={() => setMenu(false)} aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
          <Link className="item" href="/">Home <ChevronIcon width={18} height={18} /></Link>
          <Link className="item" href="/vintage-bikes/">Marketplace <ChevronIcon width={18} height={18} /></Link>
          <div className="sub">
            {categories.map((c) => (
              <Link key={c.slug} className="chip" href={`/${c.slug}/`}>{c.name}</Link>
            ))}
          </div>
          {LINKS.slice(1).map((l) => (
            <Link key={l.href} className="item" href={l.href}>
              {l.label} <ChevronIcon width={18} height={18} />
            </Link>
          ))}
          <Link className="item" href={user ? '/account/' : '/login/'}>
            {user ? 'My account' : 'Sign in / Register'} <ChevronIcon width={18} height={18} />
          </Link>
          <div className="foot">
            <a className="btn" href={`tel:${settings.phone.replace(/\s/g, '')}`}>Call {settings.phone}</a>
            <Link className="btn dark" href="/sell-your-bike/">Sell your vehicle</Link>
          </div>
        </div>
      )}
    </>
  );
}
