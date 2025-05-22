import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,                              // auto-inject registration
  skipWaiting: true,                           // activate new SW immediately
  disable: process.env.NODE_ENV === 'development', // only run PWA in prod
  sw: 'notification-sw.js',        
});

export default withPWA({
    reactStrictMode: true,
    experimental: { appDir: true },    
    images: {
      domains: [process.env.NEXT_PUBLIC_SUPABASE_STORAGE_DOMAIN], // Add your Supabase storage domain here
    },
});