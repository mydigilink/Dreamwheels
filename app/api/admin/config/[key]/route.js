import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { bad } from '@/lib/api';
import { slugify } from '@/lib/site';

const KEYS = ['settings', 'categories'];

export async function GET(_req, { params }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { key } = await params;
  if (!KEYS.includes(key)) return bad('Unknown key', 404);
  return NextResponse.json((await readDb())[key]);
}

export async function PUT(req, { params }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { key } = await params;
  if (!KEYS.includes(key)) return bad('Unknown key', 404);
  const body = await req.json().catch(() => null);
  if (!body) return bad('Invalid data');

  if (key === 'settings') {
    const saved = await writeDb((db) => {
      const n = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
      db.settings = {
        ...db.settings,
        ...body,
        whatsapp: String(body.whatsapp ?? db.settings.whatsapp).replace(/\D/g, ''),
        freeShippingAbove: n(body.freeShippingAbove, db.settings.freeShippingAbove),
        shippingFee: n(body.shippingFee, db.settings.shippingFee),
        maxUploadImages: Math.min(12, Math.max(1, n(body.maxUploadImages, 6))),
        maxUploadMb: Math.min(20, Math.max(1, n(body.maxUploadMb, 8))),
        codEnabled: !!body.codEnabled,
      };
      return db.settings;
    });
    return NextResponse.json(saved);
  }

  // categories — primary category slugs are permanent URLs, so they can't be renamed or removed here.
  if (!Array.isArray(body)) return bad('Invalid data');
  try {
    const saved = await writeDb((db) => {
      db.categories = db.categories.map((cat) => {
        const incoming = body.find((c) => c.slug === cat.slug);
        if (!incoming) return cat;
        const seen = new Set();
        const subcategories = (incoming.subcategories || [])
          .map((s) => ({ slug: slugify(s.slug || s.name), name: String(s.name || '').trim(), type: s.type || 'brand', intro: String(s.intro || '') }))
          .filter((s) => s.name && s.slug && !seen.has(s.slug) && seen.add(s.slug));
        const clash = subcategories.find((s) => db.vehicles.some((v) => v.category === cat.slug && v.slug === s.slug));
        if (clash) throw new Error(`"${clash.slug}" is already used by a vehicle URL in ${cat.name}.`);
        return { ...cat, name: incoming.name || cat.name, h1: incoming.h1 ?? cat.h1, intro: incoming.intro ?? cat.intro, kicker: incoming.kicker ?? cat.kicker, image: incoming.image ?? cat.image, subcategories };
      });
      return db.categories;
    });
    return NextResponse.json(saved);
  } catch (e) {
    return bad(e.message);
  }
}
