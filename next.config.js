/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.metahub.space",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "live.metahub.space",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "episodes.metahub.space",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
