import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['herbrx.ng'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**', // Allows all paths under this domain
      },
      {
        protocol: 'https',
        hostname: 'assets.mysite.com',
        pathname: '/images/**', // Restricts to a specific folder
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    
    ],
  },
   experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
