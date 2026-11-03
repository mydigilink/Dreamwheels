import { promises as fs } from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/upload';

const TYPES = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

// Serves uploaded images (OG-image safe: absolute, cacheable, correct content-type).
export async function GET(_req, { params }) {
  const { path: parts } = await params;
  const name = path.basename(parts.join('/'));
  const ext = path.extname(name).toLowerCase();
  if (!TYPES[ext]) return new Response('Not found', { status: 404 });
  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(file, { headers: { 'Content-Type': TYPES[ext], 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
