// Run this once (and again after any schema change — every statement is
// idempotent, so re-running is safe).
//   node scripts/setup-db.js

const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function setup() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in .env.local')
    console.error('Copy .env.example to .env.local and fill in your Neon connection string.')
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  console.log('Creating tables...')

  // The invite list. Optional — you can run an open RSVP with no guest list at
  // all — but filling it in unlocks per-party seat limits, invite codes, and
  // the "who hasn't replied yet" reminder emails.
  await sql`
    CREATE TABLE IF NOT EXISTS guests (
      id           SERIAL PRIMARY KEY,
      party_name   TEXT NOT NULL,
      email        TEXT,
      invite_code  TEXT UNIQUE,
      max_guests   INT NOT NULL DEFAULT 1,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // One row per party that responds. `attendees` is JSONB so each named guest
  // can carry their own meal choice and dietary notes without a second table.
  await sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id            SERIAL PRIMARY KEY,
      guest_id      INT REFERENCES guests(id) ON DELETE SET NULL,
      party_name    TEXT NOT NULL,
      email         TEXT NOT NULL,
      attending     BOOLEAN NOT NULL,
      attendees     JSONB NOT NULL DEFAULT '[]'::jsonb,
      song_request  TEXT,
      note          TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Guests leave a message for the couple. `approved` lets you moderate from
  // /admin before anything shows publicly.
  await sql`
    CREATE TABLE IF NOT EXISTS guestbook_posts (
      id           SERIAL PRIMARY KEY,
      author_name  TEXT NOT NULL,
      message      TEXT NOT NULL,
      image_url    TEXT,
      approved     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Engagement photos etc. Uploaded from /admin, shown on /gallery.
  await sql`
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id           SERIAL PRIMARY KEY,
      image_url    TEXT NOT NULL,
      caption      TEXT,
      sort_order   INT NOT NULL DEFAULT 0,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Stops the daily cron from mailing the same person the same thing twice.
  await sql`
    CREATE TABLE IF NOT EXISTS email_log (
      id         SERIAL PRIMARY KEY,
      email      TEXT NOT NULL,
      kind       TEXT NOT NULL,
      sent_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_email_log_once ON email_log(email, kind)`
  await sql`CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(lower(email))`
  await sql`CREATE INDEX IF NOT EXISTS idx_guestbook_created ON guestbook_posts(created_at DESC)`

  console.log('Tables created:')
  console.log('  guests          — your invite list (optional)')
  console.log('  rsvps           — one row per responding party')
  console.log('  guestbook_posts — messages from guests')
  console.log('  gallery_photos  — photos shown on /gallery')
  console.log('  email_log       — which reminder emails already went out')
}

setup().catch(err => {
  console.error('Setup failed:', err.message)
  process.exit(1)
})
