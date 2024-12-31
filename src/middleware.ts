import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons(.*)', // Exclude all icons folder files
  '/api/clerk-webhook(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match everything except Next.js internals and static assets
    '/((?!_next/|favicon.ico|manifest.json|icons/|.*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$).*)',
    // Always apply middleware for API routes
    '/(api|trpc)(.*)',
  ],
};
