import './exfat-readlink-fix.cjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@sevyo/shared-types'],
  // exFAT: no symlinks exist (install-links=true); skip symlink resolution and
  // filesystem cache snapshotting, both of which do speculative readlinks that
  // crash on the exFAT driver (see exfat-readlink-fix.cjs).
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.cache = false;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.base44.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;