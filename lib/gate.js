// Shared password gate.
//
// Deliberately uses Web Crypto rather than node:crypto: this module is
// imported by middleware, which runs on the Edge runtime where node:crypto
// isn't available. Node 18+ exposes the same API on globalThis, so one
// implementation serves both sides and the signatures always agree.

const enc = new TextEncoder()

export const COOKIE = 'wedding_access'

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}

// A shared wedding password gets typed by a hundred guests off a printed card,
// on phones that capitalise and mail clients that add spaces. Surrounding
// whitespace and letter case are almost always transcription noise rather than
// a real mismatch, so both sides are normalised before comparing. This is a
// deliberate trade for this one credential; ADMIN_TOKEN is still compared
// exactly, because that one guards every guest's email address.
export function normalisePassword(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
}

// Compares every character regardless of where the first mismatch is, so the
// response time doesn't leak how much of a guess was correct.
export function safeEqual(a, b) {
  const s1 = String(a)
  const s2 = String(b)
  if (s1.length !== s2.length) return false
  let diff = 0
  for (let i = 0; i < s1.length; i++) diff |= s1.charCodeAt(i) ^ s2.charCodeAt(i)
  return diff === 0
}

// The cookie carries its own expiry, signed alongside it, so a guest can't
// extend their own access by editing it.
export async function makeToken(secret, days = 30) {
  const exp = Date.now() + days * 86400000
  return `${exp}.${await hmac(secret, String(exp))}`
}

export async function verifyToken(secret, token) {
  if (!token) return false
  const parts = String(token).split('.')
  if (parts.length !== 2) return false

  const [exp, sig] = parts
  if (!/^\d+$/.test(exp)) return false
  if (Number(exp) < Date.now()) return false

  return safeEqual(await hmac(secret, exp), sig)
}
