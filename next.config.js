/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the simulator and bot to run alongside Next.js
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

module.exports = nextConfig;
