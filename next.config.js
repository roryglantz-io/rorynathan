/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // The optimizer fetches sources without the guest's signed cookie.
    unoptimized: Boolean(process.env.SITE_PASSWORD),
    qualities: [90],
    remotePatterns: [{ protocol: 'https', hostname: 'slimages.macysassets.com', pathname: '/is/image/BLM/products/**' }],
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
    }]
  }
}
module.exports = nextConfig
