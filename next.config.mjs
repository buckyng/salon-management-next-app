import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

export default withPWA({
    reactStrictMode: true,
    images: {
      domains: [process.env.NEXT_PUBLIC_SUPABASE_STORAGE_DOMAIN], // Add your Supabase storage domain here
    },
});