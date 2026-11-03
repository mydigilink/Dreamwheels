'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ShellContext = createContext(null);
export const useShell = () => useContext(ShellContext);

const NAV = [
  { group: 'Overview', items: [{ href: '/admin/', label: 'Dashboard', icon: '◉', color: '#636366', exact: true }] },
  {
    group: 'Catalogue',
    items: [
      { href: '/admin/vehicles/', label: 'Vehicles', icon: '🏍', color: '#bf5af2', count: 'vehicles' },
      { href: '/admin/parts/', label: 'Spare Parts', icon: '⚙', color: '#ff9f0a', count: 'parts' },
      { href: '/admin/brands/', label: 'Brands', icon: '🏷', color: '#5e5ce6', count: 'brands' },
      { href: '/admin/categories/', label: 'Categories', icon: '▦', color: '#64d2ff' },
    ],
  },
  {
    group: 'Inbox',
    items: [
      { href: '/admin/leads/', label: 'Leads', icon: '✉', color: '#0a84ff', count: 'leads', hot: true },
      { href: '/admin/orders/', label: 'Orders', icon: '🛒', color: '#30d158', count: 'orders', hot: true },
      { href: '/admin/submissions/', label: 'Sell Requests', icon: '⇄', color: '#ff375f', count: 'submissions', hot: true },
      { href: '/admin/restorations/', label: 'Restoration', icon: '🔧', color: '#ac8e68', count: 'restorations', hot: true },
    ],
  },
  { group: 'Content', items: [{ href: '/admin/blog/', label: 'Blog', icon: '✎', color: '#ff6961', count: 'posts' }] },
  { group: 'System', items: [{ href: '/admin/settings/', label: 'Settings', icon: '⚙︎', color: '#8e8e93' }] },
];

export default function AdminShell({ counts, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(null);
  const timer = useRef(null);

  useEffect(() => setNavOpen(false), [pathname]);

  const notify = useCallback((msg, type = 'ok') => {
    clearTimeout(timer.current);
    setToast({ msg, type });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // Promise-based confirm sheet: `if (await confirm({...})) …`
  const confirm = useCallback((opts) => new Promise((resolve) => setSheet({ ...opts, resolve })), []);
  const closeSheet = (v) => {
    sheet?.resolve(v);
    setSheet(null);
  };

  async function logout() {
    await fetch('/api/admin/logout/', { method: 'POST' });
    router.replace('/admin/login/');
    router.refresh();
  }

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  }

  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));
  const ctx = useMemo(() => ({ notify, confirm, openNav: () => setNavOpen(true), refresh: () => router.refresh() }), [notify, confirm, router]);

  return (
    <ShellContext.Provider value={ctx}>
      <div className="m-desktop">
        <div className={`m-window ${collapsed ? 'collapsed' : ''} ${navOpen ? 'nav-open' : ''}`}>
          {navOpen && <div className="m-scrim" onClick={() => setNavOpen(false)} />}
          <aside className="m-sidebar">
            <div className="m-traffic">
              <button title="View website" onClick={() => window.open('/', '_blank')} aria-label="View website"><span>×</span></button>
              <button title="Hide sidebar" onClick={() => setCollapsed(true)} aria-label="Hide sidebar"><span>−</span></button>
              <button title="Full screen" onClick={fullscreen} aria-label="Full screen"><span>⤢</span></button>
            </div>
            <div className="m-brand">
              <div className="ico">DW</div>
              <div><b>DreamWheels</b><small>Website Admin</small></div>
            </div>
            <nav className="m-nav">
              {NAV.map((g) => (
                <div key={g.group}>
                  <h6>{g.group}</h6>
                  {g.items.map((item) => {
                    const n = item.count ? counts[item.count] : 0;
                    return (
                      <Link key={item.href} href={item.href} className={isActive(item) ? 'active' : ''}>
                        <span className="si" style={{ background: item.color }}>{item.icon}</span>
                        {item.label}
                        {n > 0 && <span className={`badge ${item.hot ? 'hot' : ''}`}>{n}</span>}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="m-sidebar-foot">
              <a href="/" target="_blank" rel="noopener">View site ↗</a>
              <button onClick={logout}>Log out</button>
            </div>
          </aside>
          <section className="m-main">
            {collapsed && (
              <button className="m-btn plain m-hide-mobile" style={{ position: 'absolute', margin: '12px 0 0 8px', zIndex: 5 }} onClick={() => setCollapsed(false)} title="Show sidebar">
                ☰
              </button>
            )}
            {children}
          </section>
        </div>
      </div>

      {sheet && (
        <div className="m-sheet-bg" onClick={() => closeSheet(false)}>
          <div className="m-sheet" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ico">{sheet.icon || '⚠️'}</div>
            <h3>{sheet.title}</h3>
            {sheet.message && <p>{sheet.message}</p>}
            <div className="acts">
              <button className="m-btn lg" onClick={() => closeSheet(false)} autoFocus>Cancel</button>
              <button className={`m-btn lg ${sheet.danger ? 'danger solid' : 'primary'}`} onClick={() => closeSheet(true)}>{sheet.confirm || 'OK'}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`m-toast ${toast.type === 'err' ? 'err' : ''}`} role="status">{toast.type === 'err' ? '⚠︎' : '✓'} {toast.msg}</div>}
    </ShellContext.Provider>
  );
}
