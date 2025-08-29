/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ Ignore ESLint errors during build (so Vercel won’t fail)
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
