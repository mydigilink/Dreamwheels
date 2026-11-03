/** @type {import('next').NextConfig} */
const nextConfig = {
  // The live WordPress site uses trailing slashes (/vintage-bikes/). Keep them so
  // every indexed URL resolves exactly as before — SEO stability is a hard constraint.
  trailingSlash: true,
  poweredByHeader: false,
  serverExternalPackages: ['sharp'],

  // Map any legacy WordPress permalinks that differ from this app's routes here
  // (301s preserve ranking). Fill in from the current sitemap before go-live.
  async redirects() {
    return [
      // { source: '/product/:slug/', destination: '/vintage-bikes/:slug/', permanent: true },
    ];
  },
};

export default nextConfig;
