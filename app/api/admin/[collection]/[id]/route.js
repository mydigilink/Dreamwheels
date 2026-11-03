import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { COLLECTIONS, readDb, writeDb } from '@/lib/db';
import { normalize } from '@/lib/normalize';
import { bad } from '@/lib/api';

async function guard(params) {
  const deny = await requireAdmin();
  if (deny) return { deny };
  const { collection, id } = await params;
  if (!COLLECTIONS[collection]) return { deny: bad('Unknown collection', 404) };
  return { collection, id };
}

export async function GET(_req, { params }) {
  const { deny, collection, id } = await guard(params);
  if (deny) return deny;
  const item = (await readDb())[collection].find((x) => x.id === id);
  return item ? NextResponse.json(item) : bad('Not found', 404);
}

export async function PUT(req, { params }) {
  const { deny, collection, id } = await guard(params);
  if (deny) return deny;
  const body = await req.json().catch(() => null);
  if (!body) return bad('Invalid data');
  try {
    const item = await writeDb((db) => {
      const i = db[collection].findIndex((x) => x.id === id);
      if (i < 0) throw new Error('Not found');
      const createdAt = db[collection][i].createdAt;
      db[collection][i] = { id, ...normalize(collection, body, db, db[collection][i]), createdAt };
      return db[collection][i];
    });
    return NextResponse.json(item);
  } catch (e) {
    return bad(e.message, e.message === 'Not found' ? 404 : 400);
  }
}

export async function DELETE(_req, { params }) {
  const { deny, collection, id } = await guard(params);
  if (deny) return deny;
  await writeDb((db) => {
    db[collection] = db[collection].filter((x) => x.id !== id);
  });
  return NextResponse.json({ ok: true });
}
