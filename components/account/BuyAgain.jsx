'use client';
import { useCart } from '../site/CartProvider';

/** Re-adds an order's items that are still in stock. `items` = [{ part, qty }] resolved on the server. */
export default function BuyAgain({ items }) {
  const cart = useCart();
  if (!items.length) return null;
  function add() {
    items.forEach(({ part, qty }) => cart.add(part, qty, { openDrawer: false }));
    cart.setOpen(true);
  }
  return <button type="button" className="btn sm" onClick={add}>Buy again</button>;
}
