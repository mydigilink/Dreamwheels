// Signed admin session tokens. Pure functions — shared by proxy.js and route handlers.
import crypto from 'crypto';

export const ADMIN_COOKIE = 'dw_admin';
const SECRET = process.env.ADMIN_SECRET || 'dev-only-secret-change-me';
const SESSION_DAYS = 7;

const hmac = (v) => crypto.createHmac('sha256', SECRET).update(v).digest('hex');

export function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export function createSession(user) {
  const payload = `${user}|${Date.now() + SESSION_DAYS * 86400e3}`;
  return { value: `${Buffer.from(payload).toString('base64url')}.${hmac(payload)}`, maxAge: SESSION_DAYS * 86400 };
}

export function verifySession(token) {
  if (!token || !token.includes('.')) return false;
  const [b64, mac] = token.split('.');
  const payload = Buffer.from(b64, 'base64url').toString();
  if (!safeEqual(hmac(payload), mac)) return false;
  return Number(payload.split('|')[1]) > Date.now();
}

/* ---------- customer sessions ---------- */
// Signed under a separate "user:" domain so a customer token can never pass as an admin token.

export const USER_COOKIE = 'dw_user';
const USER_DAYS = 30;
const userMac = (v) => hmac(`user:${v}`);

/** data: { id, name, email, kind: 'user' | 'guest' } */
export function createUserSession(data) {
  const payload = JSON.stringify({ ...data, exp: Date.now() + USER_DAYS * 86400e3 });
  return { value: `${Buffer.from(payload).toString('base64url')}.${userMac(payload)}`, maxAge: USER_DAYS * 86400 };
}

export function readUserSession(token) {
  if (!token || !token.includes('.')) return null;
  const [b64, mac] = token.split('.');
  const payload = Buffer.from(b64, 'base64url').toString();
  if (!safeEqual(userMac(payload), mac)) return null;
  try {
    const data = JSON.parse(payload);
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}
