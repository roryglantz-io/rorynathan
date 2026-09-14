# Wedding Website

A self-contained Next.js wedding site: RSVP with meal choices, details & travel,
photo gallery, guestbook, registry links, and save-the-date / reminder emails.

It lives in this repo but is a **separate project** — it has its own
`package.json` and never imports from the KudoBoard app above it. To move it to
its own repo: copy the `wedding/` folder somewhere, `git init`, done.

---

## Start here

**1. Put your own details in `lib/config.js`.**
That one file holds every word a guest reads — names, date, schedule, venue,
hotels, registry links, FAQ. Change it first; the whole site follows.

**2. Get three free accounts:**
| Service | What for |
|---|---|
| [Neon](https://neon.tech) | Postgres database (RSVPs, guestbook) |
| [Vercel](https://vercel.com) | Hosting + Blob storage for photos |
| [Resend](https://resend.com) | Save-the-date and reminder emails |

**3. Configure and run:**
```bash
cd wedding
npm install
cp .env.example .env.local     # then fill in the values
npm run setup-db               # creates the tables
npm run dev                    # http://localhost:3000
```

**4. Deploy.** Import the repo on Vercel and set the **Root Directory** to
`wedding`. Add every variable from `.env.example` in the Vercel dashboard.

> Generate the two secrets with `openssl rand -hex 32`.

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
| `/` | Hero, countdown, our story, the short version of when & where |
| `/details` | Schedule, venue, dress code, travel, hotels, FAQ |
| `/rsvp` | The RSVP form |
| `/gallery` | Photos (uploaded from `/admin`) |
| `/guestbook` | Guests leave a message and optionally a photo |
| `/registry` | Outbound registry links |
| `/admin` | **Private.** Head count, meal totals, dietary notes, CSV export, who hasn't replied, guestbook moderation, gallery uploads, save-the-date sending |

`/admin` is protected by `ADMIN_TOKEN`. Keep it secret — anyone with it sees
every guest's email and can delete things. It's excluded in `robots.txt`, but
that only asks search engines nicely; the token is what actually protects it.

---

## How the RSVP works

- A party is **one row**, with each named guest inside it, so head count means
  chairs, not replies.
- Re-submitting with the **same email address replaces** the earlier reply
  rather than double-counting — that's how a guest edits their answer.
- The deadline in `config.rsvpDeadline` is enforced **server-side**, not just
  hidden in the UI, so a stale browser tab can't sneak a reply in afterwards.

## How the emails work

- **Save-the-dates** go out when you press the button in `/admin` — never on a
  schedule. Send yourself a preview first.
- **RSVP reminders** are sent by a daily Vercel cron (`vercel.json`) at 30, 14
  and 7 days before the deadline, only to people on the guest list who still
  haven't replied.
- Both claim a row in `email_log` **before** sending, under a unique index, so
  a double-fired cron cannot mail the same person the same thing twice.

You'll need to verify a sending domain in Resend before real mail is delivered.

---

## Tables

`guests` (invite list) · `rsvps` (one row per party, guests as JSONB) ·
`guestbook_posts` · `gallery_photos` · `email_log`

`npm run setup-db` is idempotent — safe to re-run after a schema change.

---

## Things worth doing before you launch

- [ ] Replace everything in `lib/config.js`
- [ ] Verify your sending domain in Resend
- [ ] Send yourself a save-the-date preview and read it on a phone
- [ ] Submit a test RSVP, then re-submit with the same email to confirm it edits
- [ ] Set a real `ADMIN_TOKEN` and `CRON_SECRET`
- [ ] Point your domain at Vercel
