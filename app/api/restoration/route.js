import { NextResponse } from 'next/server';
import { getSettings, uid, writeDb } from '@/lib/db';
import { bad, pick, throttled, validPhone } from '@/lib/api';
import { saveImages, UploadError } from '@/lib/upload';
import { getCurrentUser } from '@/lib/users';

export async function POST(req) {
  if (throttled(req, 10)) return bad('Too many requests, please try again later.', 429);
  const form = await req.formData().catch(() => null);
  if (!form) return bad('Invalid request');
  if (form.get('website')) return NextResponse.json({ ok: true });

  const f = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'));
  const data = pick(f, ['vehicleType', 'brand', 'model', 'year', 'condition', 'requirements', 'name', 'phone', 'email', 'city'], 3000);

  if (!['Bike', 'Scooter', 'Car'].includes(data.vehicleType)) return bad('Please choose a vehicle type.');
  for (const k of ['brand', 'model', 'year', 'condition', 'requirements', 'name']) if (!data[k]) return bad('Please fill in all required fields.');
  if (!validPhone(data.phone)) return bad('Please enter a valid phone number.');

  const settings = await getSettings();
  let images;
  try {
    images = await saveImages(form.getAll('images'), { max: settings.maxUploadImages, maxMb: settings.maxUploadMb });
  } catch (e) {
    if (e instanceof UploadError) return bad(e.message);
    throw e;
  }
  if (images.length === 0) return bad('Please add at least one photo of the vehicle.');

  const request = { id: uid('rst'), ...data, images, userId: (await getCurrentUser())?.id || '', status: 'new', notes: '', createdAt: new Date().toISOString() };
  await writeDb((db) => {
    db.restorations.unshift(request);
  });
  return NextResponse.json({ ok: true, id: request.id });
}
