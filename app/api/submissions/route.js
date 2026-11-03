import { NextResponse } from 'next/server';
import { getSettings, uid, writeDb } from '@/lib/db';
import { bad, pick, throttled, validPhone } from '@/lib/api';
import { saveImages, UploadError } from '@/lib/upload';
import { getCurrentUser } from '@/lib/users';

// Sell Your Vehicle submissions — stored privately for admin review; never auto-listed.
export async function POST(req) {
  if (throttled(req, 10)) return bad('Too many submissions, please try again later.', 429);
  const form = await req.formData().catch(() => null);
  if (!form) return bad('Invalid submission');
  if (form.get('website')) return NextResponse.json({ ok: true });

  const f = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'));
  const data = pick(f, ['vehicleType', 'brand', 'model', 'year', 'registrationState', 'kmsDriven', 'condition', 'expectedPrice', 'name', 'phone', 'email', 'city'], 2000);

  if (!['Bike', 'Car'].includes(data.vehicleType)) return bad('Please choose bike or car.');
  for (const k of ['brand', 'model', 'year', 'registrationState', 'condition', 'name']) if (!data[k]) return bad('Please fill in all required fields.');
  if (!validPhone(data.phone)) return bad('Please enter a valid phone number.');
  const year = Number(data.year);
  if (!(year >= 1900 && year <= new Date().getFullYear())) return bad('Please enter a valid year.');

  const settings = await getSettings();
  let images;
  try {
    images = await saveImages(form.getAll('images'), { max: settings.maxUploadImages, maxMb: settings.maxUploadMb });
  } catch (e) {
    if (e instanceof UploadError) return bad(e.message);
    throw e;
  }
  if (images.length === 0) return bad('Please add at least one photo.');

  const sub = {
    id: uid('sub'),
    ...data,
    year,
    expectedPrice: data.expectedPrice ? Number(String(data.expectedPrice).replace(/\D/g, '')) || null : null,
    images,
    userId: (await getCurrentUser())?.id || '',
    status: 'pending',
    notes: '',
    listingId: null,
    createdAt: new Date().toISOString(),
  };
  await writeDb((db) => {
    db.submissions.unshift(sub);
  });
  return NextResponse.json({ ok: true, id: sub.id });
}
