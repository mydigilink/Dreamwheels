import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { saveImages, UploadError } from '@/lib/upload';
import { bad } from '@/lib/api';

export async function POST(req) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const form = await req.formData().catch(() => null);
  if (!form) return bad('Invalid upload');
  try {
    // Admin uploads allow larger batches (e.g. 36–72 frames for a 360° spin).
    const urls = await saveImages(form.getAll('files'), { max: 72, maxMb: 15, width: 1800 });
    return NextResponse.json({ urls });
  } catch (e) {
    if (e instanceof UploadError) return bad(e.message);
    throw e;
  }
}
