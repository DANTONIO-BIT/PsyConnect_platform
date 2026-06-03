/** @type {import('next').NextConfig} */
const nextConfig = {
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
