import { getDb } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  try {
    const sql = getDb()
    if (req.method === 'GET') {
      const posts = await sql`
        SELECT id, author_name, message, image_url, approved, created_at
        FROM guestbook_posts
        ORDER BY created_at DESC
      `
      return res.status(200).json({ posts })
    }

    if (req.method === 'PATCH') {
      const { id, approved } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Missing id' })
      await sql`UPDATE guestbook_posts SET approved = ${!!approved} WHERE id = ${Number(id)}`
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const id = req.body?.id ?? req.query?.id
      if (!id) return res.status(400).json({ error: 'Missing id' })
      await sql`DELETE FROM guestbook_posts WHERE id = ${Number(id)}`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Admin guestbook error:', err)
    return res.status(500).json({ error: err.message })
  }
}
