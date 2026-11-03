// Shared constants and helpers — safe to import from client and server components.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const absUrl = (path = '/') => (/^https?:\/\//.test(path) ? path : SITE_URL + path);

export const MODULES = {
  marketplace: 'Vintage Vehicles Marketplace',
  parts: 'Spare Parts',
  restoration: 'Restoration Request',
  sell: 'Sell Your Vehicle',
};

export const CONDITIONS = ['Restored', 'Original', 'Custom', 'Project'];
export const AVAILABILITY = ['Available', 'Reserved', 'Sold'];
export const PART_CATEGORIES = ['Engine & Clutch', 'Wheels & Brakes', 'Body Panels', 'Electrical', 'Lighting', 'Accessories'];

export const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other'];

export const vehicleUrl =(v) => `/${v.category}/${v.slug}/`;
export const partUrl = (p) => `/spare-parts/${p.slug}/`;
export const postUrl = (p) => `/blog/${p.slug}/`;

export function formatINR(n) {
  if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return 'Price on request';
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function discountPct(price, compareAt) {
  if (!compareAt || !price || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function slugify(s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(iso);
}
