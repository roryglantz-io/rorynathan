import { getDb } from '../../../lib/db'
import { requireAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return

  try {
    const sql = getDb()
    if (req.method === 'POST') {
      const { imageUrl, caption, sortOrder } = req.body || {}
      if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' })
      if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(String(imageUrl))) {
        return res.status(400).json({ error: 'Invalid image URL.' })
      }
      const rows = await sql`
        INSERT INTO gallery_photos (image_url, caption, sort_order)
        VALUES (${imageUrl}, ${String(caption || '').trim().slice(0, 300) || null}, ${Number(sortOrder) || 0})
        RETURNING id, image_url, caption, sort_order
      `
      return res.status(201).json({ photo: rows[0] })
    }

    if (req.method === 'DELETE') {
      const id = req.body?.id ?? req.query?.id
      if (!id) return res.status(400).json({ error: 'Missing id' })
      await sql`DELETE FROM gallery_photos WHERE id = ${Number(id)}`
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Admin gallery error:', err)
    return res.status(500).json({ error: err.message })
  }
}
