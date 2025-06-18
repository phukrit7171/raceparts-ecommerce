import type { NextConfig } from "next";
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from root .env file
config({ path: path.resolve(process.cwd(), '../.env') });

const nextConfig: NextConfig = {
  env: {
    // Explicitly expose environment variables here
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network",
              "style-src 'self' 'unsafe-inline' https://m.stripe.network",
              "img-src 'self' data: https://*.stripe.com",
              "connect-src 'self' http://localhost:3000 https://api.stripe.com https://m.stripe.network",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "block-all-mixed-content",
              "upgrade-insecure-requests",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "media-src 'self'",
              "worker-src 'self'",
              "child-src 'self'",
              "manifest-src 'self'"
            ].join('; ')
          }
        ]
      }
    ]
  }
};

export default nextConfig;
