import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.metahub.space",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "live.metahub.space",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "episodes.metahub.space",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
