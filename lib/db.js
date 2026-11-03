// Tiny JSON-file data store. Fine for a single-server deployment; swap for a real
// database (MySQL/Postgres) behind the same functions if the site needs to scale out.
import { promises as fs, existsSync, copyFileSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { slugify } from './site';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const SEED_PATH = path.join(DATA_DIR, 'seed.json');

// id prefix + whether records carry a public slug
export const COLLECTIONS = {
  vehicles: { prefix: 'veh', slug: true },
  parts: { prefix: 'prt', slug: true },
  posts: { prefix: 'pst', slug: true },
  leads: { prefix: 'led' },
  submissions: { prefix: 'sub' },
  restorations: { prefix: 'rst' },
  orders: { prefix: 'ord' },
  brands: { prefix: 'brd', slug: true },
};

// Starter brand master, used until an admin saves brands for the first time.
// [name, vehicle types, country of origin]
const DEFAULT_BRANDS = [
  ['Royal Enfield', ['Bike'], 'United Kingdom / India'],
  ['Jawa', ['Bike'], 'Czechoslovakia'],
  ['Yezdi', ['Bike'], 'India'],
  ['BSA', ['Bike'], 'United Kingdom'],
  ['Triumph', ['Bike'], 'United Kingdom'],
  ['Norton', ['Bike'], 'United Kingdom'],
  ['Rajdoot', ['Bike'], 'India'],
  ['Kawasaki', ['Bike'], 'Japan'],
  ['Ducati', ['Bike'], 'Italy'],
  ['Bajaj', ['Bike', 'Scooter'], 'India'],
  ['Lambretta', ['Scooter'], 'Italy'],
  ['Vespa', ['Scooter'], 'Italy'],
  ['Fiat', ['Car'], 'Italy'],
  ['Premier', ['Car'], 'India'],
  ['Hindustan Motors', ['Car'], 'India'],
  ['Ford', ['Car'], 'United States'],
  ['Chevrolet', ['Car'], 'United States'],
  ['Jeep', ['Car'], 'United States'],
  ['Mercedes-Benz', ['Car'], 'Germany'],
  ['Volkswagen', ['Car'], 'Germany'],
  ['Austin', ['Car'], 'United Kingdom'],
  ['Morris', ['Car'], 'United Kingdom'],
];
const CATEGORY_TYPE = { 'vintage-scooters': 'Scooter', 'vintage-cars': 'Car' };

// Deterministic ids (brd_<slug>) keep defaults stable across reads before they're first persisted.
function defaultBrands(db) {
  const list = DEFAULT_BRANDS.map(([name, types, country]) => ({ name, types, country }));
  for (const v of db.vehicles || []) {
    if (v.brand && !list.some((b) => b.name.toLowerCase() === v.brand.trim().toLowerCase())) {
      list.push({ name: v.brand.trim(), types: [CATEGORY_TYPE[v.category] || 'Bike'], country: '' });
    }
  }
  const used = new Set((db.vehicles || []).map((v) => (v.brand || '').trim().toLowerCase()));
  return list.map((b, i) => ({
    id: `brd_${slugify(b.name)}`,
    slug: slugify(b.name),
    name: b.name,
    logo: '',
    types: b.types,
    country: b.country,
    founded: '',
    description: '',
    featured: used.has(b.name.toLowerCase()),
    order: i + 1,
    published: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  }));
}

function ensureDb() {
  if (!existsSync(DB_PATH)) copyFileSync(SEED_PATH, DB_PATH);
}

export async function readDb() {
  ensureDb();
  const db = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
  if (!Array.isArray(db.brands)) db.brands = defaultBrands(db);
  return db;
}

// Writes are serialised through a promise queue so concurrent requests can't clobber each other.
let queue = Promise.resolve();
export function writeDb(mutator) {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    const tmp = DB_PATH + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, DB_PATH);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export const uid = (prefix) => `${prefix}_${crypto.randomBytes(5).toString('hex')}`;

export function uniqueSlug(list, wanted, selfId) {
  const base = slugify(wanted) || 'item';
  let slug = base;
  let n = 2;
  while (list.some((x) => x.slug === slug && x.id !== selfId)) slug = `${base}-${n++}`;
  return slug;
}

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

/* ---------- public read helpers ---------- */

export async function getSettings() {
  return (await readDb()).settings;
}

export async function getCategories() {
  const { categories } = await readDb();
  return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getCategory(slug) {
  return (await getCategories()).find((c) => c.slug === slug) || null;
}

export async function getVehicles({ category, sub, featured, limit } = {}) {
  let list = (await readDb()).vehicles.filter((v) => v.published);
  if (category) list = list.filter((v) => v.category === category);
  if (sub) list = list.filter((v) => (v.subcategories || []).includes(sub));
  if (featured) list = list.filter((v) => v.featured);
  // Sold vehicles sink to the bottom but stay indexed.
  list.sort((a, b) => (a.availability === 'Sold') - (b.availability === 'Sold') || byNewest(a, b));
  return limit ? list.slice(0, limit) : list;
}

export async function getVehicle(category, slug) {
  return (await readDb()).vehicles.find((v) => v.published && v.category === category && v.slug === slug) || null;
}

/** Distinct locations of live vehicles, for the search finder. */
export async function getLocations() {
  const list = (await readDb()).vehicles.filter((v) => v.published && v.location).map((v) => v.location.trim());
  return [...new Set(list)].sort((a, b) => a.localeCompare(b));
}

const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name);

/** Published brands in admin order. */
export async function getBrands({ featured } = {}) {
  let list = (await readDb()).brands.filter((b) => b.published);
  if (featured) list = list.filter((b) => b.featured);
  return list.sort(byOrder);
}

export async function getBrand(slug) {
  return (await readDb()).brands.find((b) => b.published && b.slug === slug) || null;
}

export async function getParts({ limit } = {}) {
  const list = (await readDb()).parts.filter((p) => p.published).sort(byNewest);
  return limit ? list.slice(0, limit) : list;
}

export async function getPart(slug) {
  return (await readDb()).parts.find((p) => p.published && p.slug === slug) || null;
}

export async function getPosts({ limit } = {}) {
  const list = (await readDb()).posts.filter((p) => p.published).sort(byNewest);
  return limit ? list.slice(0, limit) : list;
}

export async function getPost(slug) {
  return (await readDb()).posts.find((p) => p.published && p.slug === slug) || null;
}
