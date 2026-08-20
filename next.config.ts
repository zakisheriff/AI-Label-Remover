import type { NextConfig } from "next";

// React's dev build needs eval(); production never does.
const scriptSrc = process.env.NODE_ENV === "development" ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/blogs",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blogs/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      {
        // The whole point of the product is that nothing is uploaded — enforce it
        // at the browser level so a stray request could not leave the page.
        source: "/",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src ${scriptSrc}; font-src 'self' data:; connect-src 'self' blob:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'`,
          },
        ],
      },
      { source: "/llms.txt", headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }] },
      { source: "/ai.txt", headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }] },
    ];
  },
};

export default nextConfig;
