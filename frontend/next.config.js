/** @type {import('next').NextConfig} */
const nextConfig = {
  // No rewrites — Next.js API routes handle all /api/v1/* calls.
  // If you deploy a separate FastAPI backend (Railway / Render / fly.io),
  // set NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app in Vercel env vars
  // and the api.ts client will route calls there automatically.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
