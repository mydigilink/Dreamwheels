// Image uploads: validated, resized and converted to WebP on the way in (spec §4.7 / §5.7).
// Stored outside /public and served by app/media/[...path] so new files work after `next build`.
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export class UploadError extends Error {}

export async function saveImages(files, { max = 6, maxMb = 8, width = 1600 } = {}) {
  const images = files.filter((f) => f && typeof f === 'object' && f.size > 0);
  if (images.length > max) throw new UploadError(`Please upload at most ${max} images.`);
  for (const f of images) {
    if (!ALLOWED.includes(f.type)) throw new UploadError(`${f.name}: only JPG, PNG or WebP images are allowed.`);
    if (f.size > maxMb * 1024 * 1024) throw new UploadError(`${f.name} is larger than ${maxMb} MB.`);
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  let sharp = null;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    // sharp unavailable — originals are stored as-is.
  }

  const urls = [];
  for (const f of images) {
    const buf = Buffer.from(await f.arrayBuffer());
    const id = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
    let name;
    if (sharp) {
      name = `${id}.webp`;
      const out = await sharp(buf).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      await fs.writeFile(path.join(UPLOAD_DIR, name), out);
    } else {
      name = `${id}.${f.type.split('/')[1].replace('jpeg', 'jpg')}`;
      await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
    }
    urls.push(`/media/${name}`);
  }
  return urls;
}
