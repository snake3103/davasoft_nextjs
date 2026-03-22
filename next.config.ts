import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Previene clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Previene MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control de referrer
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Protección XSS legacy browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // HSTS - Solo HTTPS en producción
          { 
            key: "Strict-Transport-Security", 
            value: "max-age=63072000; includeSubDomains; preload" 
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self y inline para Next.js
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: self y inline
              "style-src 'self' 'unsafe-inline'",
              // Images: self, data URLs, y CDNs comunes
              "img-src 'self' data: https: blob:",
              // Fonts: self y Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Connections: API y WebSocket
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co ws://localhost:* http://localhost:*",
              // Frames: none (previene clickjacking adicional)
              "frame-src 'none'",
              // Objects: none
              "object-src 'none'",
              // Media: self y blob para uploads
              "media-src 'self' blob:",
              // Workers: blob para service workers
              "worker-src 'self' blob:",
              // Base URI restrictiva
              "base-uri 'self'",
              // Form action restrictiva
              "form-action 'self'",
              // Frame ancestors
              "frame-ancestors 'none'",
            ].join("; ")
          },
          // Permissions Policy (control de APIs del navegador)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()"
          },
        ],
      },
      // Headers específicos para recursos estáticos
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      // Headers para assets
      {
        source: "/_next/media/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  // Configuración de seguridad adicional
  async redirects() {
    return [
      // Forzar HTTPS en producción (si hay un proxy delante, comentar esto)
      // {
      //   source: '/(.*)',
      //   has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
      //   destination: 'https://:host/:path*',
      //   permanent: true,
      // },
    ];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  hideSourceMaps: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
