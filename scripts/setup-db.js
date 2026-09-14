// Creates the tables. Run once — and again after any schema change, since
// every statement is idempotent.
//   node scripts/setup-db.js
//
// Two alternatives if you'd rather not use a terminal:
//   - press "Set up database" in /admin, or
//   - paste scripts/schema.sql into your database provider's SQL editor.
// All three run the same statements from lib/schema.js.

const { neon } = require('@neondatabase/serverless')
const { STATEMENTS } = require('../lib/schema')
const { DB_URL_VARS, resolveDatabaseUrl } = require('../lib/database-url')
require('dotenv').config({ path: '.env.local' })

async function setup() {
  const { url, from } = resolveDatabaseUrl()
  if (!url) {
    console.error('No database connection string found in .env.local')
    console.error('Set one of: ' + DB_URL_VARS.join(', '))
    process.exit(1)
  }

  const sql = neon(url)
  console.log(`Creating tables (using ${from})...`)

  for (const statement of STATEMENTS) {
    await sql([statement.sql])
    console.log('  ' + statement.label)
  }

  console.log('Done.')
}

setup().catch(err => {
  console.error('Setup failed:', err.message)
  process.exit(1)
})
