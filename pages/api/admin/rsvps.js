import { getDb } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const sql = getDb()

    const rsvps = await sql`
      SELECT id, party_name, email, attending, attendees, song_request, note, created_at, updated_at
      FROM rsvps
      ORDER BY created_at DESC
    `

    // Head count comes from the attendees array, not the row count — a party of
    // four is one row but four chairs.
    let attendingHeads = 0
    const meals = {}
    const dietary = []

    for (const r of rsvps) {
      if (!r.attending) continue
      const list = Array.isArray(r.attendees) ? r.attendees : []
      attendingHeads += list.length
      for (const a of list) {
        meals[a.meal] = (meals[a.meal] || 0) + 1
        if (a.dietary) dietary.push({ name: a.name, dietary: a.dietary })
      }
    }

    // Anyone on the invite list who still hasn't replied.
    const awaiting = await sql`
      SELECT g.party_name, g.email, g.max_guests
      FROM guests g
      LEFT JOIN rsvps r ON r.guest_id = g.id OR lower(r.email) = lower(g.email)
      WHERE r.id IS NULL
      ORDER BY g.party_name
    `

    const stats = {
      partiesResponded: rsvps.length,
      partiesAttending: rsvps.filter(r => r.attending).length,
      partiesDeclined: rsvps.filter(r => !r.attending).length,
      attendingHeads,
      meals,
      dietary,
      awaitingCount: awaiting.length,
    }

    if (req.query.format === 'csv') {
      const rows = [['Party', 'Email', 'Attending', 'Guest', 'Meal', 'Dietary', 'Song request', 'Note', 'Submitted']]
      for (const r of rsvps) {
        const list = Array.isArray(r.attendees) ? r.attendees : []
        if (!r.attending || list.length === 0) {
          rows.push([r.party_name, r.email, r.attending ? 'Yes' : 'No', '', '', '', r.song_request || '', r.note || '', fmt(r.created_at)])
        } else {
          for (const a of list) {
            rows.push([r.party_name, r.email, 'Yes', a.name, a.meal, a.dietary || '', r.song_request || '', r.note || '', fmt(r.created_at)])
          }
        }
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename="rsvps.csv"')
      return res.status(200).send(rows.map(r => r.map(csvCell).join(',')).join('\n'))
    }

    return res.status(200).json({ rsvps, stats, awaiting })
  } catch (err) {
    console.error('Admin RSVP error:', err)
    return res.status(500).json({ error: err.message })
  }
}

function fmt(d) {
  return d ? new Date(d).toISOString().slice(0, 16).replace('T', ' ') : ''
}

// Excel treats a leading =, +, - or @ as a formula. Prefix those with a quote
// so an exported note can't execute when the couple opens the CSV.
function csvCell(value) {
  let s = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}
