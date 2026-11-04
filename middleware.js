import { NextResponse } from 'next/server'
import { COOKIE, verifyToken } from './lib/gate'

export const config = {
  // Keep the unlock screen, framework assets, and public identity icons usable
  // before guest authentication. Cron endpoints authenticate themselves.
  matcher: ['/((?!_next/static|favicon\\.(?:ico|svg)$|apple-touch-icon\\.png$|robots.txt|unlock|api/unlock|api/cron).*)'],
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
