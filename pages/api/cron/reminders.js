import { getDb } from '../../../lib/db'
import { sendEmail, rsvpReminderEmail } from '../../../lib/email'
import config from '../../../lib/config'

// Vercel hits this daily (see vercel.json). It mails everyone on the invite
// list who still hasn't replied, but only on the milestone days below — and
// the email_log unique index makes a second send for the same milestone a
// no-op even if the cron fires twice.
const MILESTONES = [30, 14, 7]

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // No deadline set yet, so there's nothing to count down to. Checked before
  // we open a connection: a dormant reminder job should say it has nothing to
  // do, not report a database error. Without it the arithmetic below is NaN
  // and every comparison quietly returns false.
  if (!config.rsvpDeadline) {
    return res.status(200).json({ sent: 0, message: 'No RSVP deadline set; nothing to remind about.' })
  }

  try {
    const sql = getDb()

    const msLeft = new Date(config.rsvpDeadline).getTime() - Date.now()
    const daysLeft = Math.ceil(msLeft / 86400000)

    const milestone = MILESTONES.find(m => m === daysLeft)
    if (!milestone) {
      return res.status(200).json({ sent: 0, daysLeft, message: 'Not a reminder day.' })
    }

    const kind = `rsvp_reminder_${milestone}`

    const pending = await sql`
      SELECT g.id, g.party_name, g.email, g.invite_code
      FROM guests g
      LEFT JOIN rsvps r ON r.guest_id = g.id OR lower(r.email) = lower(g.email)
      LEFT JOIN email_log e ON lower(e.email) = lower(g.email) AND e.kind = ${kind}
      WHERE g.email IS NOT NULL
        AND r.id IS NULL
        AND e.id IS NULL
    `

    const results = []
    for (const guest of pending) {
      try {
        // Claim the send before making it. If the insert conflicts, another
        // run already took this one and we skip rather than double-mail.
        const claimed = await sql`
          INSERT INTO email_log (email, kind) VALUES (${guest.email.toLowerCase()}, ${kind})
          ON CONFLICT (email, kind) DO NOTHING
          RETURNING id
        `
        if (claimed.length === 0) continue

        const { subject, html } = rsvpReminderEmail({
          partyName: guest.party_name,
          inviteCode: guest.invite_code,
          daysLeft: milestone,
        })
        await sendEmail({ to: guest.email, subject, html })
        results.push({ email: guest.email, status: 'sent' })
      } catch (err) {
        console.error(`Reminder failed for ${guest.email}:`, err)
        // Release the claim so the next run can retry this address.
        await sql`DELETE FROM email_log WHERE lower(email) = ${guest.email.toLowerCase()} AND kind = ${kind}`
        results.push({ email: guest.email, status: 'failed', error: err.message })
      }
    }

    return res.status(200).json({
      daysLeft: milestone,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    })
  } catch (err) {
    console.error('Reminder cron error:', err)
    return res.status(500).json({ error: err.message })
  }
}
