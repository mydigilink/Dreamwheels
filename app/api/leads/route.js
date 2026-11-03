import { NextResponse } from 'next/server';
import { uid, writeDb } from '@/lib/db';
import { bad, pick, throttled, validPhone } from '@/lib/api';
import { getCurrentUser } from '@/lib/users';

// Captures both enquiry-form submissions and WhatsApp clicks with identical context
// (vehicle/product, category, page URL, source module) for attribution in the admin.
export async function POST(req) {
  if (throttled(req, 60)) return bad('Too many requests, please try again later.', 429);
  let body;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return bad('Invalid request');
  }
  if (body.website) return NextResponse.json({ ok: true }); // honeypot

  const type = body.type === 'whatsapp' ? 'whatsapp' : 'form';
  const lead = {
    id: uid('led'),
    type,
    ...pick(body, ['module', 'itemName', 'itemId', 'category', 'pageUrl', 'name', 'phone', 'email'], 300),
    message: type === 'form' ? pick(body, ['message'], 2000).message : '',
    userId: (await getCurrentUser())?.id || '',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  if (!lead.pageUrl) return bad('Missing page reference');
  if (type === 'form') {
    if (!lead.name) return bad('Please enter your name.');
    if (!validPhone(lead.phone)) return bad('Please enter a valid phone number.');
  }

  await writeDb((db) => {
    db.leads.unshift(lead);
  });
  return NextResponse.json({ ok: true, id: lead.id });
}
