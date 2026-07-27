/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'hamplard.com'],
  },
  async redirects() {
    return [
      { source: '/auth/login', destination: '/login', permanent: true },
      { source: '/auth/signup', destination: '/signup', permanent: true },
    ];
  },
};
module.exports = nextConfig;
