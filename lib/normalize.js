// Coerces admin form payloads into clean records per collection.
import { uniqueSlug } from './db';
import { isHtml, sanitizePostHtml } from './content';
import { BRAND_TYPES } from './brands';

const num = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));
const arr = (v) => (Array.isArray(v) ? v.filter((x) => x !== '' && x !== null && x !== undefined) : typeof v === 'string' && v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
const bool = (v) => v === true || v === 'true' || v === 'on';

export function normalize(collection, body, db, existing) {
  // Merge over the existing record so partial updates (e.g. a "published" toggle) keep other fields.
  const out = { ...(existing || {}), ...body };
  delete out.id;
  delete out.createdAt;

  if (['vehicles', 'parts', 'posts'].includes(collection)) {
    out.title = String(out.title ?? '').trim();
    if (!out.title) throw new Error('Title is required.');
    out.slug = uniqueSlug(db[collection], out.slug || out.title, existing?.id);
    out.published = bool(out.published);
  }
  if (collection === 'vehicles') {
    out.year = num(out.year);
    out.price = num(out.price);
    out.featured = bool(out.featured);
    for (const k of ['images', 'spin360', 'subcategories']) out[k] = arr(out[k]);
    if (!db.categories.some((c) => c.slug === out.category)) throw new Error('Choose a valid category.');
    const valid = db.categories.find((c) => c.slug === out.category).subcategories.map((s) => s.slug);
    out.subcategories = out.subcategories.filter((s) => valid.includes(s));
    out.source = out.source || 'dreamwheels';
  }
  if (collection === 'parts') {
    out.price = num(out.price) ?? 0;
    out.compareAt = num(out.compareAt);
    out.stock = Math.max(0, Math.floor(num(out.stock) ?? 0));
    out.mode = out.mode === 'enquiry' ? 'enquiry' : 'checkout';
    out.images = arr(out.images);
    out.compatibility = arr(out.compatibility);
    out.specs = Array.isArray(out.specs) ? out.specs.filter((s) => s && s.k) : [];
  }
  if (collection === 'brands') {
    out.name = String(out.name ?? '').trim().slice(0, 80);
    if (!out.name) throw new Error('Brand name is required.');
    const key = out.name.toLowerCase();
    if (db.brands.some((b) => b.id !== existing?.id && b.name.toLowerCase() === key)) throw new Error(`A brand called “${out.name}” already exists.`);
    out.slug = uniqueSlug(db.brands, out.slug || out.name, existing?.id);
    out.types = arr(out.types).filter((t) => BRAND_TYPES.includes(t));
    out.logo = String(out.logo || '');
    for (const k of ['country', 'founded']) out[k] = String(out[k] ?? '').trim().slice(0, 80);
    out.description = String(out.description ?? '').slice(0, 5000);
    out.order = num(out.order) ?? db.brands.length + 1;
    out.featured = bool(out.featured);
    out.published = bool(out.published);
    // Vehicles reference brands by name, so a rename carries over to them.
    if (existing && existing.name !== out.name) {
      for (const v of db.vehicles) if ((v.brand || '').trim().toLowerCase() === existing.name.toLowerCase()) v.brand = out.name;
    }
  }
  if (collection === 'posts') {
    out.tags = arr(out.tags);
    if (isHtml(out.content || '')) out.content = sanitizePostHtml(out.content);
  }
  out.updatedAt = new Date().toISOString();
  return out;
}
