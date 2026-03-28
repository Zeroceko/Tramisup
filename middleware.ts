import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',
  
  // Always use locale prefix
  localePrefix: 'always'
});

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // If logged in and on landing page (e.g., /tr or /en), redirect to dashboard
  // next-intl middleware will redirect / to /[defaultLocale]
  // So we check if the pathname is exactly /[locale] or /[locale]/
  const isRootLocale = locales.some(l => pathname === `/${l}` || pathname === `/${l}/`);
  
  if (token && isRootLocale) {
    const locale = pathname.split('/')[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(tr|en)/:path*']
};
