'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const SavedContext = createContext(null);

/** Holds the signed-in customer's saved vehicles/parts as "type:id" keys. */
export function SavedProvider({ initial = [], signedIn = false, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [keys, setKeys] = useState(() => new Set(initial));

  const toggle = useCallback(
    async (type, id) => {
      if (!signedIn) return router.push(`/login/?next=${encodeURIComponent(pathname)}`);
      const key = `${type}:${id}`;
      const saved = !keys.has(key);
      setKeys((prev) => {
        const next = new Set(prev);
        saved ? next.add(key) : next.delete(key);
        return next;
      });
      const res = await fetch('/api/account/saved/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, saved }) }).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (res?.ok && data?.saved) setKeys(new Set(data.saved));
      else setKeys((prev) => {
        // Roll back the optimistic change.
        const next = new Set(prev);
        saved ? next.delete(key) : next.add(key);
        return next;
      });
      if (pathname.startsWith('/account')) router.refresh();
    },
    [keys, signedIn, router, pathname],
  );

  const value = useMemo(() => ({ has: (type, id) => keys.has(`${type}:${id}`), toggle, count: keys.size }), [keys, toggle]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export const useSaved = () => useContext(SavedContext);
