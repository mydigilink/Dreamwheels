import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { OAUTH_COOKIE, PROVIDERS, isConfigured, redirectUriFor } from '@/lib/oauth';
import { safeNext } from '@/lib/users';

// Step 1: send the visitor to Google / Facebook, with a random state to block CSRF.
export async function GET(req, { params }) {
  const { provider } = await params;
  const p = PROVIDERS[provider];
  const next = safeNext(req.nextUrl.searchParams.get('next'));
  if (!p) return NextResponse.redirect(new URL('/login/', req.url));
  if (!isConfigured(p)) return NextResponse.redirect(new URL(`/login/?error=${provider}_not_configured`, req.url));

  const state = crypto.randomBytes(16).toString('hex');
  const q = new URLSearchParams({ client_id: p.clientId(), redirect_uri: redirectUriFor(req, provider), state, ...p.authParams });
  const res = NextResponse.redirect(`${p.authUrl}?${q}`);
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, provider, next }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
  return res;
}
