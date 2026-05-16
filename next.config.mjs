/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/static/:path*",
        destination: "/:path*",
      },
    ]
  },
}

export default nextConfig
