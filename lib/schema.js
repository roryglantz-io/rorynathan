// The single source of truth for the database schema.
//
// Used by `npm run setup-db`, by the "Set up database" button in /admin, and
// by `npm run schema:sql`, which regenerates scripts/schema.sql from this
// list. Keeping one copy means the three can't drift apart.
//
// Every statement is IF NOT EXISTS, so running any of them again is safe.

const STATEMENTS = [
  {
    label: 'guests — your invite list (optional)',
    comment:
      'Your invite list. Optional — leave it empty and anyone with the link can\n' +
      '-- RSVP. Fill it in and you get per-party seat limits, invite codes, and\n' +
      '-- reminder emails to whoever has not replied.',
    sql: `CREATE TABLE IF NOT EXISTS guests (
  id           SERIAL PRIMARY KEY,
  party_name   TEXT NOT NULL,
  email        TEXT,
  invite_code  TEXT UNIQUE,
  max_guests   INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
)`,
  },
  {
    label: 'rsvps — one row per responding party',
    comment:
      'One row per party that replies. Each named guest lives in `attendees`\n' +
      '-- with their own meal choice and dietary note, so a party of four is one\n' +
      '-- row and four chairs.',
    sql: `CREATE TABLE IF NOT EXISTS rsvps (
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
)`,
  },
  {
    label: 'email_log — which reminder emails already went out',
    comment:
      'Stops the daily reminder job from mailing the same person the same thing\n' +
      '-- twice, even if it fires more than once.',
    sql: `CREATE TABLE IF NOT EXISTS email_log (
  id      SERIAL PRIMARY KEY,
  email   TEXT NOT NULL,
  kind    TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
)`,
  },
  { label: 'index: one reminder per person per kind', sql: 'CREATE UNIQUE INDEX IF NOT EXISTS idx_email_log_once ON email_log(email, kind)' },
  { label: 'index: RSVP lookup by email', sql: 'CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(lower(email))' },
]

module.exports = { STATEMENTS }
