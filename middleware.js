import { NextResponse } from 'next/server'
import { COOKIE, verifyToken } from './lib/gate'

export const config = {
  // Everything except: Next's own assets, the unlock screen and the endpoint
  // behind it (locking those would make the site impossible to enter), and
  // the cron endpoint, which Vercel calls with no cookie and which already
  // authenticates itself with CRON_SECRET.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|unlock|api/unlock|api/cron).*)'],
}

export async function middleware(req) {
  const password = process.env.SITE_PASSWORD

  // No password configured means the site is simply public. This is the
  // default, so forgetting the variable can't accidentally lock everyone out.
  if (!password) return NextResponse.next()

  const token = req.cookies.get(COOKIE)?.value
  if (await verifyToken(password, token)) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = '/unlock'
  // Send them where they were headed once they're in.
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search)
  return NextResponse.redirect(url)
}
