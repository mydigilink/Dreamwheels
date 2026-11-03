import { NextResponse } from 'next/server';
import { OAUTH_COOKIE, PROVIDERS, isConfigured, redirectUriFor } from '@/lib/oauth';
import { claimGuestRecords, getCurrentUser, normEmail, publicUser, setUserCookie, upsertSocialUser } from '@/lib/users';
import { safeEqual } from '@/lib/session';

// Step 2: the provider sends the visitor back here with a one-time code.
export async function GET(req, { params }) {
  const { provider } = await params;
  const p = PROVIDERS[provider];
  const sp = req.nextUrl.searchParams;
  const fail = (code) => {
    const res = NextResponse.redirect(new URL(`/login/?error=${code}`, req.url));
    res.cookies.set(OAUTH_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  };

  if (!p || !isConfigured(p)) return fail('oauth_failed');
  if (sp.get('error')) return fail('oauth_cancelled');

  let saved = {};
  try {
    saved = JSON.parse(req.cookies.get(OAUTH_COOKIE)?.value || '{}');
  } catch {}
  const code = sp.get('code');
  if (!code || !saved.state || saved.provider !== provider || !safeEqual(saved.state, sp.get('state') || '')) return fail('oauth_failed');

  try {
    const profile = await p.profile(code, redirectUriFor(req, provider));
    const user = await upsertSocialUser({ provider, providerId: String(profile.providerId), email: normEmail(profile.email), name: String(profile.name || '').slice(0, 100) });
    const prev = await getCurrentUser();
    if (prev?.kind === 'guest') await claimGuestRecords(prev.id, user.id);
    const res = NextResponse.redirect(new URL(saved.next || '/account/', req.url));
    res.cookies.set(OAUTH_COOKIE, '', { path: '/', maxAge: 0 });
    return setUserCookie(res, publicUser(user));
  } catch (e) {
    console.error(`[oauth:${provider}]`, e.message);
    return fail('oauth_failed');
  }
}
