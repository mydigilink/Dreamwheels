import { readDb } from '@/lib/db';
import { absUrl, partUrl, postUrl, vehicleUrl } from '@/lib/site';
import { brandUrl } from '@/lib/brands';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const db = await readDb();
  const fixed = ['/', '/brands/', '/spare-parts/', '/restoration/', '/sell-your-bike/', '/blog/', '/contact/'];
  const cats = db.categories.flatMap((c) => [`/${c.slug}/`, ...(c.subcategories || []).map((s) => `/${c.slug}/${s.slug}/`)]);
  return [
    ...fixed.map((p) => ({ url: absUrl(p), changeFrequency: 'weekly', priority: p === '/' ? 1 : 0.8 })),
    ...cats.map((p) => ({ url: absUrl(p), changeFrequency: 'weekly', priority: 0.7 })),
    ...db.vehicles.filter((v) => v.published).map((v) => ({ url: absUrl(vehicleUrl(v)), lastModified: v.updatedAt || v.createdAt, priority: 0.6 })),
    ...db.brands.filter((b) => b.published).map((b) => ({ url: absUrl(brandUrl(b)), lastModified: b.updatedAt || b.createdAt, priority: 0.6 })),
    ...db.parts.filter((p) => p.published).map((p) => ({ url: absUrl(partUrl(p)), lastModified: p.updatedAt || p.createdAt, priority: 0.5 })),
    ...db.posts.filter((p) => p.published).map((p) => ({ url: absUrl(postUrl(p)), lastModified: p.updatedAt || p.createdAt, priority: 0.5 })),
  ];
}
