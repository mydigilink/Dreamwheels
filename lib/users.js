// Customer accounts: email/password, guest checkout and Google/Facebook sign-in.
// Users live in db.users — deliberately NOT in COLLECTIONS, so the generic admin CRUD API
// can never expose password hashes.
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { readDb, uid, writeDb } from './db';
import { USER_COOKIE, createUserSession, readUserSession } from './session';

export { USER_COOKIE };

export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');
export const normEmail = (e) => String(e || '').trim().toLowerCase().slice(0, 200);

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

export function checkPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(String(password), salt, 64);
  const want = Buffer.from(hash, 'hex');
  return want.length === test.length && crypto.timingSafeEqual(want, test);
}

/** The public shape of a user — safe to send to the browser. */
export const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, kind: 'user', provider: u.provider || 'email' });

export async function findUserByEmail(email) {
  return ((await readDb()).users || []).find((u) => u.email === normEmail(email)) || null;
}

export async function getUserRecord(id) {
  return ((await readDb()).users || []).find((u) => u.id === id) || null;
}

export function createUser({ name, email, password }) {
  return writeDb((db) => {
    db.users ||= [];
    if (db.users.some((u) => u.email === email)) return null;
    const u = { id: uid('usr'), name, email, password: hashPassword(password), provider: 'email', createdAt: new Date().toISOString() };
    db.users.unshift(u);
    return u;
  });
}

/** Finds the user linked to a social profile (or with the same verified email) and creates one if needed. */
export function upsertSocialUser({ provider, providerId, email, name }) {
  return writeDb((db) => {
    db.users ||= [];
    const key = `${provider}Id`;
    let u = db.users.find((x) => x[key] === providerId) || (email && db.users.find((x) => x.email === email));
    if (!u) {
      u = { id: uid('usr'), name: name || 'Customer', email: email || '', provider, createdAt: new Date().toISOString() };
      db.users.unshift(u);
    }
    u[key] = providerId;
    if (!u.name && name) u.name = name;
    u.lastLoginAt = new Date().toISOString();
    return u;
  });
}

export class AccountError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Runs fn(user, db) against the stored customer record inside a serialised write. */
export function updateUser(id, fn) {
  return writeDb((db) => {
    const u = (db.users || []).find((x) => x.id === id);
    if (!u) throw new AccountError('Account not found.', 404);
    return fn(u, db);
  });
}

const OWNED = ['orders', 'leads', 'submissions', 'restorations'];

/** Moves everything a guest session created onto the account they just signed into. */
export function claimGuestRecords(guestId, userId) {
  if (!guestId?.startsWith('gst_')) return Promise.resolve(0);
  return writeDb((db) => {
    let n = 0;
    for (const c of OWNED) for (const r of db[c] || []) if (r.userId === guestId) (r.userId = userId), n++;
    return n;
  });
}

/** Everything a customer (or guest session) has created, newest first. */
export function ownedRecords(db, ownerId) {
  return Object.fromEntries(OWNED.map((c) => [c, (db[c] || []).filter((r) => r.userId === ownerId)]));
}

/**
 * The signed-in customer (or guest) from the session cookie, or null.
 * Registered users are re-read from the store so profile edits apply at once and
 * deleted accounts are signed out automatically.
 */
export async function getCurrentUser() {
  const store = await cookies();
  const session = readUserSession(store.get(USER_COOKIE)?.value);
  if (!session || session.kind !== 'user') return session;
  const u = await getUserRecord(session.id);
  return u ? { ...publicUser(u), exp: session.exp } : null;
}

/** For customer-only APIs: returns [user, null] or [null, 401 response]. */
export async function requireCustomer() {
  const user = await getCurrentUser();
  if (user?.kind === 'user') return [user, null];
  return [null, NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })];
}

export function setUserCookie(res, data) {
  const session = createUserSession(data);
  res.cookies.set(USER_COOKIE, session.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  });
  return res;
}

/** Only allow same-site relative redirects after login. */
export const safeNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/account/');

/* ---------- addresses ---------- */

export const MAX_ADDRESSES = 10;
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

/** Validates an address from the browser; throws AccountError with a user-facing message. */
export function cleanAddress(a = {}) {
  const out = {
    label: clip(a.label, 40) || 'Home',
    name: clip(a.name, 100),
    phone: clip(a.phone, 20),
    address: clip(a.address, 500),
    city: clip(a.city, 80),
    state: clip(a.state, 60),
    pincode: clip(a.pincode, 6),
  };
  if (!out.name || !out.address || !out.city || !out.state) throw new AccountError('Please complete the address.');
  if (!/^[+\d][\d\s-]{7,}$/.test(out.phone)) throw new AccountError('Please enter a valid phone number.');
  if (!/^[1-9]\d{5}$/.test(out.pincode)) throw new AccountError('Please enter a valid 6-digit pincode.');
  return out;
}

/** Adds an address unless an identical one exists. Returns the stored address. */
export function addAddress(u, addr, { makeDefault = false } = {}) {
  u.addresses ||= [];
  const same = u.addresses.find((x) => x.address === addr.address && x.pincode === addr.pincode && x.name === addr.name);
  if (same) return same;
  if (u.addresses.length >= MAX_ADDRESSES) throw new AccountError(`You can save up to ${MAX_ADDRESSES} addresses.`);
  const rec = { id: uid('adr'), ...addr, isDefault: makeDefault || u.addresses.length === 0 };
  if (rec.isDefault) u.addresses.forEach((x) => (x.isDefault = false));
  u.addresses.push(rec);
  return rec;
}

export const defaultAddress = (u) => u?.addresses?.find((a) => a.isDefault) || u?.addresses?.[0] || null;
