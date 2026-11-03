// Google & Facebook sign-in via the standard OAuth 2.0 authorization-code flow.
const FB = 'https://graph.facebook.com/v19.0';

export const PROVIDERS = {
  google: {
    label: 'Google',
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    authParams: { scope: 'openid email profile', response_type: 'code', prompt: 'select_account' },
    async profile(code, redirectUri) {
      const tok = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: this.clientId(), client_secret: this.clientSecret(), redirect_uri: redirectUri, grant_type: 'authorization_code' }),
      }).then((r) => r.json());
      if (!tok.access_token) throw new Error('Google token exchange failed');
      const p = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tok.access_token}` } }).then((r) => r.json());
      if (!p.sub) throw new Error('Google profile unavailable');
      // Only trust the email for account linking when Google has verified it.
      return { providerId: p.sub, email: p.email_verified ? p.email : '', name: p.name };
    },
  },
  facebook: {
    label: 'Facebook',
    clientId: () => process.env.FACEBOOK_APP_ID,
    clientSecret: () => process.env.FACEBOOK_APP_SECRET,
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    authParams: { scope: 'email,public_profile', response_type: 'code' },
    async profile(code, redirectUri) {
      const q = new URLSearchParams({ code, client_id: this.clientId(), client_secret: this.clientSecret(), redirect_uri: redirectUri });
      const tok = await fetch(`${FB}/oauth/access_token?${q}`).then((r) => r.json());
      if (!tok.access_token) throw new Error('Facebook token exchange failed');
      const p = await fetch(`${FB}/me?fields=id,name,email&access_token=${encodeURIComponent(tok.access_token)}`).then((r) => r.json());
      if (!p.id) throw new Error('Facebook profile unavailable');
      return { providerId: p.id, email: p.email || '', name: p.name };
    },
  },
};

export const OAUTH_COOKIE = 'dw_oauth';

export const isConfigured = (p) => Boolean(p?.clientId() && p?.clientSecret());

/** Must exactly match the redirect URI registered in the Google / Facebook developer console. */
export const redirectUriFor = (req, provider) => `${process.env.AUTH_URL || req.nextUrl.origin}/api/auth/oauth/${provider}/callback/`;
