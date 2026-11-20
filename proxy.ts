import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/auth/signout')) return response;

  // Dee users must never be treated as Directlines customers.
  if (user && user.user_metadata?.app === 'dee') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signout';
    url.search = '';
    url.searchParams.set('next', '/login');
    url.searchParams.set('reason', 'wrong_app');
    return NextResponse.redirect(url);
  }

  if (!user && (pathname.startsWith('/account') || pathname.startsWith('/admin'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const url = request.nextUrl.clone();
    url.pathname = profile?.role === 'admin' || profile?.role === 'staff' ? '/admin' : '/account';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/account'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signout';
      url.search = '';
      url.searchParams.set('next', '/login');
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/admin') && profile.role !== 'admin' && profile.role !== 'staff') {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|webm|mp4)$).*)',
  ],
};
