'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'dw_cart_v1';

export function CartProvider({ children, settings }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((part, qty = 1, { openDrawer = true } = {}) => {
    setItems((prev) => {
      const max = part.stock > 0 ? part.stock : 99;
      const existing = prev.find((i) => i.id === part.id);
      if (existing) return prev.map((i) => (i.id === part.id ? { ...i, qty: Math.min(max, i.qty + qty) } : i));
      return [...prev, { id: part.id, slug: part.slug, title: part.title, price: part.price, image: part.images?.[0] || '', sku: part.sku, stock: part.stock, qty: Math.min(max, qty) }];
    });
    if (openDrawer) setOpen(true);
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(i.stock > 0 ? i.stock : 99, qty)) } : i)));
  }, []);
  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const freeAbove = settings?.freeShippingAbove ?? 999;
    const shipping = subtotal === 0 || subtotal >= freeAbove ? 0 : settings?.shippingFee ?? 99;
    return { items, add, setQty, remove, clear, open, setOpen, subtotal, count, shipping, total: subtotal + shipping, freeAbove, ready };
  }, [items, add, setQty, remove, clear, open, settings, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
