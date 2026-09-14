# Wedding Website

A self-contained Next.js wedding site for **Rory & Nathan**: RSVP with meal
choices, details & travel, registry, and save-the-date / reminder emails.

It lives in this repo but is a **separate project** — it has its own
`package.json` and never imports from the KudoBoard app above it. To move it to
its own repo: copy the `wedding/` folder somewhere, `git init`, done.

---

## Start here

**1. Put your own details in `lib/config.js`.**
That one file holds every word a guest reads. Date and venue are currently
marked TBD — see *While the date is unset* below.

**2. Get the accounts you need:**
| Service | What for |
|---|---|
| [Neon](https://neon.tech) | Postgres database (RSVPs) |
| [Vercel](https://vercel.com) | Hosting |
| [Resend](https://resend.com) | Save-the-date and reminder emails |

**3. Configure and run:**
```bash
cd wedding
npm install
cp .env.example .env.local     # then fill in the values
npm run setup-db               # creates the tables
npm run dev                    # http://localhost:3000
```

No terminal handy? `scripts/schema.sql` is the same thing as a single
paste-able block — open the Neon SQL Editor in your browser, paste, Run. It's
verified to produce a schema identical to `npm run setup-db`, down to the
indexes and the foreign key's ON DELETE behaviour.

**4. Deploy.** Import the repo on Vercel and set the **Root Directory** to
`wedding`. Add every variable from `.env.example` in the Vercel dashboard.

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

Black and white, no colour anywhere. Hierarchy comes from scale, weight,
letter-spacing and hairline rules.

- **Pinyon Script** — the couple's names and section headings only. Never used
  below about 1.8rem, where a script this fine stops being readable.
- **Times New Roman** — everything else, including subheadings, body, labels,
  buttons and numerals. It's a system font, so it costs no network request.

Because nothing is distinguished by colour, links are underlined rather than
tinted. Every text tone clears WCAG AA on both backgrounds: ink 17.4:1,
ink-soft 11.3:1, ink-faint 6.3:1 at worst.

To re-theme, change the six values at the top of `styles/globals.css`.

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

`npm run setup-db` is idempotent — safe to re-run after a schema change.

---

## Before you launch

- [ ] Replace the remaining placeholders in `lib/config.js`
- [ ] Verify your sending domain in Resend
- [ ] Send yourself a save-the-date preview and read it on a phone
- [ ] Submit a test RSVP, then re-submit with the same email to confirm it edits
- [ ] Set a real `ADMIN_TOKEN` and `CRON_SECRET`
- [ ] Decide whether to set `SITE_PASSWORD`, and put it on the invitation
- [ ] Point your domain at Vercel
