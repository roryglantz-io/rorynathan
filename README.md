# Wedding Website

A Next.js wedding site for **Rory & Nathan**, June 6, 2027, in Philadelphia, PA.
The public site contains engagement photographs, Details, and the Bloomingdale’s registry.

The app lives at the repository root. Use Node.js 24.

---

## Start here

**1. Edit `lib/config.js`.**
That file holds names, the confirmed date, location, named photo roles, and the registry link.
Details remain deliberately sparse until the plans are final.

**2. Add services only when needed.**
The current public pages do not need a database or email account.
To enable RSVP and guest administration later, configure a PostgreSQL database.
The app uses the standard `postgres` driver, with a vendor-independent schema.

Connections are configured for serverless and for pooled Postgres: one
connection per instance, TLS on anything that isn't localhost, and prepared
statements disabled — Supabase and any pgbouncer in transaction mode can't
hold prepared statements across pooled connections.

[Resend](https://resend.com) is needed only for save-the-date and reminder emails.
Do not send emails until the guest list and invitation information are ready.

**3. Configure and run:**
```bash
cd rorynathan
npm ci
cp .env.example .env.local     # optional for public-page development
# Configure a database before running npm run setup-db.
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

**4. Deploy.** The Vercel project is `darthcater-4055s-projects/rorynathan`.
Use the repository root, the Next.js preset, and Node.js 24.
Cloudflare manages DNS for `roryandnathan.com`; Vercel hosts the app.
Production uses `NEXT_PUBLIC_BASE_URL=https://roryandnathan.com`.
`www.roryandnathan.com` redirects to the apex domain.

**5. Check the build and routes:**
```bash
npm test
```
This builds the app and checks six page routes on a temporary production server.
It also checks the registry destination, hidden RSVP links, and noindex directives on pages, photos, and a 404.
It does not submit RSVP data, send emails, or replace browser checks.

> Generate the two secrets with `openssl rand -hex 32`.

---

## Current public state

- The wedding date is June 6, 2027; the location is Penn Valley, PA.
- Details shows only the known date, location, and a note that plans are still being finalized.
- RSVP links and the information-collection button are hidden.
- The `/rsvp` route and backend remain available for later setup; hiding navigation does not disable them.
- The reply deadline remains `null`, so reminder emails remain dormant.
- The registry links directly to the couple’s Bloomingdale’s registry. No unsupported iframe is used.

## Search indexing

Every page includes `noindex, nofollow, noimageindex` metadata.
All responses also carry these directives in `X-Robots-Tag`, including photo assets and error pages.
These directives ask compliant search engines not to index the site. They are not access control.
Use `SITE_PASSWORD` for the separate guest password gate.
Gated builds serve photographs directly with the guest cookie instead of using the image optimizer.
The middleware also gates optimizer URLs, including previously cached derivatives.

---

## Design

The save-the-date supplies visual inspiration only: warm sand and ivory, a serif,
and a restrained script accent. Its wording and printed-card layout are not copied.

- **Fraunces** currently serves the serif roles; **Alex Brush** serves the ampersand.
  These are substitutes, not the requested Recoleta and Burgues Script. Exact font
  integration requires the licensed webfont files, which are not in the checkout.
- Both fonts are bundled from `@fontsource-variable/fraunces` and
  `@fontsource/alex-brush` through `next/font/local`. No Google Fonts requests.
- The homepage shows the couple’s names, date, Philadelphia location, and a three-photo gallery.
- Details and Registry use the same palette and serif family. No announcement slogans.
- The RN favicon uses Fraunces glyph outlines on the sand color. SVG, 16/32/48px ICO,
  and 180px Apple formats are included.

Photographs come from the downloaded originals. The proposal portrait is a
2000 × 2500 crop of `_ORY4538.jpg`; other images are 1800–2400px derivatives at quality 94–95.
Responsive `next/image` delivery uses quality 90, and exported files omit source metadata.

## Registry

The registry page displays the complete Bloomingdale’s registry, including prices,
photographs, purchased quantities, and availability. The data comes from Bloomingdale’s
public registry endpoint, not a Firecrawl dependency.
The homepage uses a single Registry link. The catalog heading does not repeat the retailer name.
The catalog matches Bloomingdale’s registry filters: category, Purchased / Still needed / Unavailable,
five price bands, a custom price range, recent or price sorting, and infinite scrolling with
20/40-item loading increments.
Product images, titles, and “Shop this gift” links open the couple’s registry in a new tab
with an origin referrer. Purchases stay in Bloomingdale’s registry session so they retain
registry attribution.

`lib/registry.js` reads the public Bloomingdale’s registry API with the public client
identifier in `BLOOMINGDALES_API_KEY`, normalizes every item, and hashes the products.
`pages/api/registry.js` caches the result for one hour with an ETag; the page refreshes
hourly and on focus. The saved catalog is the fallback if a refresh fails. No timestamp
or sync controls are shown.

Adding to the Bloomingdale’s bag from this site is not implemented: Bloomingdale’s
cross-origin policy does not allow bag requests from another domain, and a server-side
request would create the server’s bag rather than the guest’s.

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
| `/` | Couple’s names, date/location, photo gallery, Details and Registry links |
| `/details` | Known date/location and a finalizing-details note |
| `/registry` | Saved Bloomingdale’s catalog and registry links; hosted sync remains blocked |
| `/rsvp` | Retained RSVP form, hidden from public navigation |
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
