// Vercel's storage integrations inject the connection string under whichever
// name the provider chose — POSTGRES_URL for some, DATABASE_URL for others,
// plus separate pooled/unpooled variants. Accepting all of the usual names
// means "I added a database in the Vercel dashboard" just works, instead of
// the app insisting nothing is configured while a database sits right there.
//
// Order matters: prefer the pooled/standard names, fall back to unpooled.
const DB_URL_VARS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
]

function resolveDatabaseUrl(env = process.env) {
  for (const name of DB_URL_VARS) {
    const value = env[name]
    if (value && String(value).trim()) return { url: String(value).trim(), from: name }
  }
  return { url: null, from: null }
}

module.exports = { DB_URL_VARS, resolveDatabaseUrl }
