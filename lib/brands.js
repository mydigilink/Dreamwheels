// Brand master helpers — pure functions, safe to import from client and server components.
// Vehicles store the brand *name* (keeps existing data and search working); these helpers
// resolve that name to the brand record for logos and links.

export const BRAND_TYPES = ['Bike', 'Scooter', 'Car'];

export const brandKey = (s = '') => String(s).trim().toLowerCase();
export const brandUrl = (b) => `/brands/${b.slug}/`;

export function findBrand(brands = [], name) {
  const k = brandKey(name);
  return k ? brands.find((b) => brandKey(b.name) === k) || null : null;
}

/** Initials for the monogram shown when a brand has no logo yet. */
export const brandInitials = (name = '') =>
  String(name)
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

/** Brand names a part fits, from its free-text compatibility list ("Royal Enfield Bullet 350" → "Royal Enfield"). */
export function partBrands(part, brands = []) {
  const byLength = [...brands].sort((a, b) => b.name.length - a.name.length);
  return [
    ...new Set(
      (part.compatibility || []).map((c) => byLength.find((b) => brandKey(c).startsWith(brandKey(b.name)))?.name || String(c).split(' ')[0]),
    ),
  ];
}

/** Brands to offer in a vehicle-type picker. "Bike" also covers scooters (the Sell form groups them). */
export function brandsForType(brands = [], type) {
  const want = type === 'Bike' ? ['Bike', 'Scooter'] : [type];
  return brands.filter((b) => !b.types?.length || b.types.some((t) => want.includes(t)));
}
