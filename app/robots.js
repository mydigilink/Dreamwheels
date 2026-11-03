import { absUrl } from '@/lib/site';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/cart/', '/checkout/'] }],
    sitemap: absUrl('/sitemap.xml'),
  };
}
