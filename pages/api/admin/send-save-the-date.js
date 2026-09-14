import { getDb } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'
import { sendEmail, saveTheDateEmail } from '../../../lib/email'

// Save-the-dates go out once, when the couple decides — not on a schedule.
// POST { test: "you@example.com" } sends a single preview to yourself first.
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const kind = 'save_the_date'

  try {
    const sql = getDb()
    if (req.body?.test) {
      const { subject, html } = saveTheDateEmail({ partyName: 'Test Guest', inviteCode: 'PREVIEW' })
      await sendEmail({ to: req.body.test, subject, html })
      return res.status(200).json({ ok: true, test: true, to: req.body.test })
    }

    const pending = await sql`
      SELECT g.id, g.party_name, g.email, g.invite_code
      FROM guests g
      LEFT JOIN email_log e ON lower(e.email) = lower(g.email) AND e.kind = ${kind}
      WHERE g.email IS NOT NULL AND e.id IS NULL
    `

    const results = []
    for (const guest of pending) {
      try {
        const claimed = await sql`
          INSERT INTO email_log (email, kind) VALUES (${guest.email.toLowerCase()}, ${kind})
          ON CONFLICT (email, kind) DO NOTHING
          RETURNING id
        `
        if (claimed.length === 0) continue

        const { subject, html } = saveTheDateEmail({
          partyName: guest.party_name,
          inviteCode: guest.invite_code,
        })
        await sendEmail({ to: guest.email, subject, html })
        results.push({ email: guest.email, status: 'sent' })
      } catch (err) {
        console.error(`Save-the-date failed for ${guest.email}:`, err)
        await sql`DELETE FROM email_log WHERE lower(email) = ${guest.email.toLowerCase()} AND kind = ${kind}`
        results.push({ email: guest.email, status: 'failed', error: err.message })
      }
    }

    return res.status(200).json({
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    })
  } catch (err) {
    console.error('Save-the-date error:', err)
    return res.status(500).json({ error: err.message })
  }
}
