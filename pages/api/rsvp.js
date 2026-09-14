import { getDb } from '../../lib/db'
import config from '../../lib/config'

const MEALS = ['chicken', 'fish', 'vegetarian', 'vegan']

export default async function handler(req, res) {
  if (req.method === 'GET') return lookup(req, res)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // The deadline is enforced here, not just hidden in the UI — otherwise a
  // stale browser tab can still submit a week after the caterer is counted.
  // A null deadline means there isn't one yet, so replies stay open. Without
  // this guard `new Date(null)` is the epoch and every RSVP is refused.
  if (config.rsvpDeadline && Date.now() > new Date(config.rsvpDeadline).getTime()) {
    return res.status(403).json({
      error: `RSVPs closed on ${config.rsvpDeadlineLabel}. Please email ${config.contactEmail} and we'll sort it out.`,
    })
  }

  try {
    const { partyName, email, attending, attendees, songRequest, note, inviteCode } = req.body || {}

    if (!partyName || !String(partyName).trim()) {
      return res.status(400).json({ error: 'Please tell us your name.' })
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email).trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }
    if (typeof attending !== 'boolean') {
      return res.status(400).json({ error: 'Please let us know whether you can make it.' })
    }

    // Everything the shape of the request can tell us is checked before we
    // open a connection, so a malformed body gets its real 400 message even
    // while the database is down — and a bad request costs no connection.
    let cleanAttendees = []
    if (attending) {
      if (!Array.isArray(attendees) || attendees.length === 0) {
        return res.status(400).json({ error: 'Please add at least one name.' })
      }
      if (attendees.length > 10) {
        return res.status(400).json({ error: 'That is a lot of people. Email us instead and we will sort it out.' })
      }

      cleanAttendees = attendees.map(a => ({
        name: String(a?.name || '').trim().slice(0, 120),
        meal: MEALS.includes(a?.meal) ? a.meal : 'chicken',
        dietary: String(a?.dietary || '').trim().slice(0, 500),
      }))

      if (cleanAttendees.some(a => !a.name)) {
        return res.status(400).json({ error: 'Every guest needs a name.' })
      }
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const sql = getDb()

    // Resolve the invite code, if the couple is running a guest list. It caps
    // how many seats this party can claim, so it needs the database.
    let guestId = null
    if (inviteCode) {
      const rows = await sql`
        SELECT id, max_guests FROM guests WHERE lower(invite_code) = ${String(inviteCode).trim().toLowerCase()}
      `
      if (rows.length === 0) {
        return res.status(404).json({ error: "We couldn't find that invite code. Check the card, or just leave it blank." })
      }
      guestId = rows[0].id
      const maxGuests = rows[0].max_guests

      if (attending && cleanAttendees.length > maxGuests) {
        return res.status(400).json({
          error: `Your invitation has ${maxGuests} seat${maxGuests === 1 ? '' : 's'}. Email ${config.contactEmail} if that looks wrong.`,
        })
      }
    }

    // Let people change their mind: a second submission from the same email
    // replaces the first rather than double-counting the party.
    const existing = await sql`SELECT id FROM rsvps WHERE lower(email) = ${normalizedEmail} LIMIT 1`

    if (existing.length > 0) {
      await sql`
        UPDATE rsvps SET
          guest_id     = ${guestId},
          party_name   = ${String(partyName).trim().slice(0, 200)},
          attending    = ${attending},
          attendees    = ${JSON.stringify(cleanAttendees)}::jsonb,
          song_request = ${String(songRequest || '').trim().slice(0, 300) || null},
          note         = ${String(note || '').trim().slice(0, 1000) || null},
          updated_at   = NOW()
        WHERE id = ${existing[0].id}
      `
      return res.status(200).json({ ok: true, updated: true, attending })
    }

    await sql`
      INSERT INTO rsvps (guest_id, party_name, email, attending, attendees, song_request, note)
      VALUES (
        ${guestId},
        ${String(partyName).trim().slice(0, 200)},
        ${normalizedEmail},
        ${attending},
        ${JSON.stringify(cleanAttendees)}::jsonb,
        ${String(songRequest || '').trim().slice(0, 300) || null},
        ${String(note || '').trim().slice(0, 1000) || null}
      )
    `

    return res.status(201).json({ ok: true, updated: false, attending })
  } catch (err) {
    console.error('RSVP error:', err)
    return res.status(500).json({ error: 'Something went wrong saving your RSVP. Please try again.' })
  }
}

// GET /api/rsvp?code=XYZ — look up a party by invite code so the form can
// pre-fill names and cap the number of seats.
async function lookup(req, res) {
  const code = String(req.query.code || '').trim().toLowerCase()
  if (!code) return res.status(400).json({ error: 'No invite code provided.' })

  try {
    const sql = getDb()
    const rows = await sql`
      SELECT party_name, email, max_guests FROM guests WHERE lower(invite_code) = ${code}
    `
    if (rows.length === 0) return res.status(404).json({ error: 'Invite code not found.' })

    return res.status(200).json({
      partyName: rows[0].party_name,
      email: rows[0].email || '',
      maxGuests: rows[0].max_guests,
    })
  } catch (err) {
    console.error('Invite lookup error:', err)
    return res.status(500).json({ error: 'Lookup failed.' })
  }
}
