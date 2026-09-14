import { COOKIE, makeToken, safeEqual } from '../../lib/gate'

const DAYS = 30

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const password = process.env.SITE_PASSWORD
  if (!password) return res.status(200).json({ ok: true, open: true })

  const given = req.body?.password
  if (!given) return res.status(400).json({ error: 'Please enter the password.' })

  if (!safeEqual(given, password)) {
    return res.status(401).json({ error: "That's not the password. Check the invitation, or ask us." })
  }

  const token = await makeToken(password, DAYS)

  res.setHeader('Set-Cookie', [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',                                   // JavaScript can't read it
    'SameSite=Lax',
    `Max-Age=${DAYS * 24 * 60 * 60}`,
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; '))

  return res.status(200).json({ ok: true })
}
