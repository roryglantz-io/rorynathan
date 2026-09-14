import { getDb, runRaw } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'
import { STATEMENTS } from '../../../lib/schema'

// Creates the tables, so the database can be set up from the browser without
// a terminal or a SQL console. Every statement is IF NOT EXISTS, so pressing
// the button twice is harmless.
export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const sql = getDb()
    const done = []

    for (const statement of STATEMENTS) {
      await runRaw(sql, statement.sql)
      done.push(statement.label)
    }

    return res.status(200).json({ ok: true, created: done })
  } catch (err) {
    console.error('Setup error:', err)
    return res.status(500).json({ error: err.message })
  }
}
