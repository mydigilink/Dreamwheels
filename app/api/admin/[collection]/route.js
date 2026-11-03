import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { COLLECTIONS, readDb, uid, writeDb } from '@/lib/db';
import { normalize } from '@/lib/normalize';
import { bad } from '@/lib/api';

export async function GET(_req, { params }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { collection } = await params;
  if (!COLLECTIONS[collection]) return bad('Unknown collection', 404);
  const db = await readDb();
  return NextResponse.json([...db[collection]].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}

export async function POST(req, { params }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { collection } = await params;
  if (!COLLECTIONS[collection]) return bad('Unknown collection', 404);
  const body = await req.json().catch(() => null);
  if (!body) return bad('Invalid data');
  try {
    const item = await writeDb((db) => {
      const rec = { id: uid(COLLECTIONS[collection].prefix), ...normalize(collection, body, db), createdAt: new Date().toISOString() };
      db[collection].unshift(rec);
      return rec;
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    return bad(e.message);
  }
}
