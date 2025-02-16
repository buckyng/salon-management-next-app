import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from './lib/supabase/server';

// Define public routes
const isPublicRoute = (url: string) => {
  const publicRoutes = ['/', '/manifest.json', '/favicon.ico', '/icons'];

  return publicRoutes.some((route) => url.startsWith(route));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip authentication for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Create a Supabase client with the current request
  const supabase = await createSupabaseClient();

  // Get session information
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Redirect unauthenticated users to the sign-in page
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Fetch user metadata for group information
  try {
    // Fetch authenticated user data
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        'Error fetching user data:',
        userError?.message || 'No user found.'
      );
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Skip authentication for reset password routes
    if (
      !user &&
      !request.nextUrl.pathname.includes('/login') &&
      !request.nextUrl.pathname.includes('/reset-password') &&
      !request.nextUrl.pathname.includes('/forgot-password')
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const groups = user.user?.app_metadata.groups || {};

    // Redirect based on group information
    if (Object.keys(groups).length === 1) {
      // If the user belongs to only one group, redirect to its dashboard
      const groupId = Object.keys(groups)[0];
      return NextResponse.redirect(
        new URL(`/${groupId}/dashboard`, request.url)
      );
    }

    if (Object.keys(groups).length > 1) {
      // If the user belongs to multiple groups, redirect to the group picker page
      return NextResponse.redirect(new URL('/group-picker', request.url));
    }

    // If the user does not belong to any group, redirect them to a support/contact page
    return NextResponse.redirect(new URL('/no-groups', request.url));
  } catch (error) {
    console.error('Error during authentication middleware:', error);
    // Log the user out if something goes wrong
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
