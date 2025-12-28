/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME: process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME,
    NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID: process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID,
    NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNIN: process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNIN,
    NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNUP: process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNUP,
    NEXT_PUBLIC_AZURE_AD_B2C_POLICY_RESET: process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_RESET,
  },

  // Security headers
  async headers() {
    // Build CSP directives
    // Note: 'unsafe-inline' for styles is required for Tailwind CSS
    // In production, consider using nonces for stricter CSP
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: self + Azure AD B2C authentication
      "script-src 'self' 'unsafe-eval' https://*.b2clogin.com https://login.microsoftonline.com",
      // Styles: self + inline (required for Tailwind/CSS-in-JS)
      "style-src 'self' 'unsafe-inline'",
      // Images: self + data URIs + blob for charts
      "img-src 'self' data: blob: https:",
      // Fonts: self + common CDNs
      "font-src 'self' data:",
      // Connect: API server + Azure AD B2C + telemetry
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'} https://*.b2clogin.com https://login.microsoftonline.com https://*.microsoft.com`,
      // Frame: only allow Azure AD B2C for auth popups
      "frame-src 'self' https://*.b2clogin.com https://login.microsoftonline.com",
      // Prevent this site from being framed
      "frame-ancestors 'none'",
      // Form submissions only to self
      "form-action 'self'",
      // Base URI restriction
      "base-uri 'self'",
      // Block mixed content
      "block-all-mixed-content",
      // Upgrade insecure requests in production
      ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  // Webpack configuration for MSAL
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
