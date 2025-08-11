
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  experimental: { esmExternals: 'loose' },
  eslint: { ignoreDuringBuilds: true }
};
module.exports = nextConfig;
