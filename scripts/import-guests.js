// Bulk-load your invite list from a CSV.
//   node scripts/import-guests.js guests.csv
//
// The CSV needs a header row with these columns (extras are ignored):
//   party_name,email,max_guests
//
// Example:
//   party_name,email,max_guests
//   "The Nakamura Family",yuki@example.com,4
//   "Priya Raman",priya@example.com,2
//
// Each party gets a random invite code, printed at the end so you can put it
// on the physical invitation. Re-running updates existing parties matched by
// email rather than creating duplicates.

const postgres = require('postgres')
const { DB_URL_VARS, resolveDatabaseUrl } = require('../lib/database-url')
const { connectionOptions } = require('../lib/db-options')
const fs = require('fs')
const crypto = require('crypto')
require('dotenv').config({ path: '.env.local' })

// No vowels and no 0/O/1/I/L — codes get read aloud over the phone and
// hand-copied off a card, so ambiguity is expensive.
const ALPHABET = '23456789BCDFGHJKMNPQRSTVWXYZ'

function makeCode() {
  let out = ''
  const bytes = crypto.randomBytes(6)
  for (let i = 0; i < 6; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

// Minimal CSV reader: handles quoted fields and escaped "" inside them.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field); field = ''
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(cell => cell.trim() !== ''))
}

async function main() {
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: node scripts/import-guests.js guests.csv')
    process.exit(1)
  }
  const { url } = resolveDatabaseUrl()
  if (!url) {
    console.error('No database connection string found in .env.local')
    console.error('Set one of: ' + DB_URL_VARS.join(', '))
    process.exit(1)
  }

  const rows = parseCsv(fs.readFileSync(file, 'utf8'))
  if (rows.length < 2) {
    console.error('That CSV has no data rows.')
    process.exit(1)
  }

  const header = rows[0].map(h => h.trim().toLowerCase())
  const iName = header.indexOf('party_name')
  const iEmail = header.indexOf('email')
  const iMax = header.indexOf('max_guests')

  if (iName === -1) {
    console.error('CSV needs a "party_name" column. Found: ' + header.join(', '))
    process.exit(1)
  }

  const sql = postgres(url, connectionOptions(url))
  const added = []
  let updated = 0

  for (const row of rows.slice(1)) {
    const partyName = (row[iName] || '').trim()
    if (!partyName) continue
    const email = iEmail === -1 ? null : (row[iEmail] || '').trim().toLowerCase() || null
    const maxGuests = iMax === -1 ? 1 : Math.max(1, parseInt(row[iMax], 10) || 1)

    const existing = email
      ? await sql`SELECT id, invite_code FROM guests WHERE lower(email) = ${email}`
      : []

    if (existing.length > 0) {
      await sql`
        UPDATE guests SET party_name = ${partyName}, max_guests = ${maxGuests}
        WHERE id = ${existing[0].id}
      `
      updated++
      continue
    }

    // Retry on the astronomically unlikely code collision.
    let code
    for (let attempt = 0; attempt < 5; attempt++) {
      code = makeCode()
      const clash = await sql`SELECT id FROM guests WHERE invite_code = ${code}`
      if (clash.length === 0) break
      code = null
    }
    if (!code) {
      console.error(`Could not generate a unique code for ${partyName} — skipped.`)
      continue
    }

    await sql`
      INSERT INTO guests (party_name, email, invite_code, max_guests)
      VALUES (${partyName}, ${email}, ${code}, ${maxGuests})
    `
    added.push({ partyName, email, code, maxGuests })
  }

  console.log(`\nAdded ${added.length} parties, updated ${updated}.\n`)
  if (added.length) {
    console.log('Invite codes — put these on the invitations:\n')
    for (const g of added) {
      console.log(`  ${g.code}   ${g.partyName}  (${g.maxGuests} seat${g.maxGuests === 1 ? '' : 's'})`)
    }
    console.log('')
  }
}

main().catch(err => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
