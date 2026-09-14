import crypto from 'crypto'

// Constant-time compare so a wrong token can't be discovered a character at a
// time by timing the response.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

// Reads the admin token from the Authorization header or an `admin` query
// param (so the couple can just bookmark /admin?admin=TOKEN on their phones).
export function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN
  if (!expected) return false

  const header = req.headers.authorization || ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null
  const provided = bearer || req.query?.admin || req.body?.adminToken

  if (!provided) return false
  return safeEqual(provided, expected)
}

export function requireAdmin(req, res) {
  if (!isAdmin(req)) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}
