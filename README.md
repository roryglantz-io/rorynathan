# Wedding Website

A self-contained Next.js wedding site for **Rory & Nathan**: RSVP with meal
choices, details & travel, registry, and save-the-date / reminder emails.

The app lives at the repository root. Use Node.js 20.9 or later.

---

## Start here

**1. Put your own details in `lib/config.js`.**
That file holds the couple’s names, dates, venues, and guest information.
Date and venue are currently marked TBD — see *While the date is unset* below.

**2. Get the accounts you need.**
A [Vercel](https://vercel.com) account alone is enough to start: add a Postgres
database from its Storage tab and Vercel provisions it and injects the
connection string into the project, so there's no second signup and no string
to copy. Any Postgres works — Supabase, Neon, or your own server. The app uses the
standard `postgres` driver over plain PostgreSQL, with nothing vendor-specific
in the schema or the queries, and is tested against stock PostgreSQL 16.

Connections are configured for serverless and for pooled Postgres: one
connection per instance, TLS on anything that isn't localhost, and prepared
statements disabled — Supabase and any pgbouncer in transaction mode can't
hold prepared statements across pooled connections.

[Resend](https://resend.com) is only needed for save-the-date and reminder
emails. Skip it until you have a date — those features stay dormant until then.

**3. Configure and run:**
```bash
cd rorynathan
npm ci
cp .env.example .env.local     # then fill in the values
npm run setup-db               # creates the tables
npm run dev                    # http://localhost:3000
```

No terminal? Two other ways to create the tables, both running the same
statements from `lib/schema.js`:

- **Press "Set up database" in `/admin`.** Easiest on a fresh deploy — sign in
  with your `ADMIN_TOKEN` and the button appears on the error screen that
  shows when the tables don't exist yet.
- **Paste `scripts/schema.sql`** into any SQL editor. It's generated from
  `lib/schema.js` by `npm run schema:sql`, so it can't drift from the code.

All three are verified to produce an identical schema — same 20 columns, same
6 indexes, same ON DELETE behaviour on the foreign key.

**4. Deploy.** Import the repo on Vercel. Leave **Root Directory** at the
repository root, not `wedding`. Configure the variables from `.env.example`.
Use Node.js 24 in the Vercel project settings.

**5. Check the build and routes:**
```bash
npm test
```
This builds the app and checks six page routes on a temporary local server.
It does not test database writes, email delivery, or browser interactions.

> Generate the two secrets with `openssl rand -hex 32`.

---

## While the date is unset

`lib/config.js` starts with `dateTbd: true` and `rsvpDeadline: null`. In that
state the site says so plainly rather than showing placeholder dates:

- the countdown is hidden entirely,
- the RSVP form stays open with no deadline, and asks "do you think you can
  make it?" instead of "will you be joining us?",
- reminder emails do nothing, because there's nothing to count down to,
- sections with nothing in them yet — airports, hotels, dress code, the venue
  map link — are hidden rather than rendered empty.

When you have a date: set `dateTbd: false`, fill in `weddingDate`,
`weddingDateLabel` and `location`, then set `rsvpDeadline` and
`rsvpDeadlineLabel`. The countdown, the deadline copy and the reminder cron all
switch on by themselves.

---

## Design

Black and white, with no colour. Hierarchy comes from scale, weight, and
hairline rules.

- **Bodoni Moda** — the couple's names and page titles. It is a Didone, the
  face an engraved invitation would use.
- **Baskerville** — body text, labels, buttons, and numerals. Palatino and
  Georgia provide fallbacks.

Links are underlined because colour cannot mark them. The text tones clear
WCAG AA on both backgrounds.

To re-theme, change the six colour values at the top of `styles/globals.css`.

---

## Password protecting the site

Set `SITE_PASSWORD` and every page asks for it before showing anything. Put the
password on the invitation. Leave the variable unset and the site is public —
that's the default, so a missing variable can never lock everyone out.

How it works: `middleware.js` checks a signed cookie on every request. The
cookie carries its own expiry signed alongside it, so it can't be edited to
extend access, and it's `HttpOnly` so page scripts can't read it. Guests stay
signed in for 30 days. Someone who follows a link to a specific page lands on
that page after unlocking, not on the homepage.

Three paths are deliberately exempt, or the site couldn't function: Next's
static assets, `/unlock` and the endpoint behind it, and `/api/cron/*`, which
Vercel calls with no cookie and which authenticates itself with `CRON_SECRET`.

**This is one shared password, not per-guest accounts.** It keeps the site out
of search results and away from casual visitors. Anyone a guest forwards the
password to can get in, so don't treat it as a secret — and `/admin` keeps its
own separate `ADMIN_TOKEN` on top, because that page shows every guest's email.

To change the password later, edit the variable in Vercel and redeploy.
Existing cookies stop working immediately, so everyone signs in again.

---

## The guest list (optional)

You can run an open RSVP where anyone with the link replies. Filling in the
guest list additionally gives you per-party seat limits, invite codes, and
reminder emails to the people who haven't replied.

Make a CSV:
```csv
party_name,email,max_guests
"The Nakamura Family",yuki@example.com,4
"Priya Raman",priya@example.com,2
```
Then:
```bash
node scripts/import-guests.js guests.csv
```
It prints an invite code per party — put those on the invitations. A guest who
opens `/rsvp?code=BCDF23` gets their name pre-filled and can only claim the
seats you've held for them.

---

## Pages

| Route | What it is |
|---|---|
| `/` | Names, date, and where things stand |
| `/details` | Schedule, venue, dress code, travel, FAQ |
| `/registry` | Registry links |
| `/rsvp` | The RSVP form |
| `/unlock` | Password prompt, when `SITE_PASSWORD` is set |
| `/admin` | **Private.** Head count, meal totals, dietary notes, CSV export, who hasn't replied, save-the-date sending |

`/admin` is protected by `ADMIN_TOKEN`. Keep it secret — anyone with it sees
every guest's email. It's excluded in `robots.txt`, but that only asks search
engines nicely; the token is what actually protects it.

---

## How the RSVP works

- A party is **one row**, with each named guest inside it, so head count means
  chairs, not replies.
- Re-submitting with the **same email address replaces** the earlier reply
  rather than double-counting — that's how a guest edits their answer.
- Once set, the deadline is enforced **server-side**, not just hidden in the
  UI, so a stale browser tab can't sneak a reply in afterwards.

## How the emails work

- **Save-the-dates** go out when you press the button in `/admin` — never on a
  schedule. Send yourself a preview first.
- **RSVP reminders** are sent by a daily Vercel cron (`vercel.json`) at 30, 14
  and 7 days before the deadline, only to people on the guest list who still
  haven't replied. Dormant until a deadline exists.
- Both claim a row in `email_log` **before** sending, under a unique index, so
  a double-fired cron cannot mail the same person the same thing twice.

You'll need to verify a sending domain in Resend before real mail is delivered.

---

## Tables

`guests` (invite list) · `rsvps` (one row per party, guests as JSONB) ·
`email_log`

The schema lives in `lib/schema.js` and nowhere else. `npm run setup-db`, the
`/admin` button and `scripts/schema.sql` all read from it, so the three can't
disagree; regenerate the `.sql` file with `npm run schema:sql` after a change.
Every statement is `IF NOT EXISTS`, so all three are safe to re-run.

---

## Before you launch

- [ ] Replace the remaining placeholders in `lib/config.js`
- [ ] Verify your sending domain in Resend
- [ ] Send yourself a save-the-date preview and read it on a phone
- [ ] Submit a test RSVP, then re-submit with the same email to confirm it edits
- [ ] Set a real `ADMIN_TOKEN` and `CRON_SECRET`
- [ ] Decide whether to set `SITE_PASSWORD`, and put it on the invitation
- [ ] Point your domain at Vercel
