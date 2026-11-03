import { NextResponse } from 'next/server';

export const bad = (error, status = 400) => NextResponse.json({ error }, { status });

const clean = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : v == null ? '' : String(v).slice(0, max));
export const pick = (obj, keys, max) => Object.fromEntries(keys.map((k) => [k, clean(obj[k], max)]));

export const validPhone = (p) => /^[+\d][\d\s-]{7,}$/.test(p || '');

// Simple per-IP, per-endpoint throttle for public form endpoints (single-instance deployments).
// Keyed by path too, so e.g. sending enquiries never uses up the sign-in allowance.
const hits = new Map();
export function throttled(req, limit = 20, windowMs = 10 * 60 * 1000) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const key = `${ip} ${new URL(req.url).pathname}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}
