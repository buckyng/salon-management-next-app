import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

export default withPWA({
    reactStrictMode: true,
    images: {
      domains: ['yuydlfabcomardopckat.supabase.co'], // Add your Supabase storage domain here
    },
});