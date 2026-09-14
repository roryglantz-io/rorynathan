import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const sql = getDb()
    const photos = await sql`
      SELECT id, image_url, caption
      FROM gallery_photos
      ORDER BY sort_order ASC, created_at DESC
      LIMIT 200
    `
    return res.status(200).json({ photos })
  } catch (err) {
    console.error('Gallery read error:', err)
    return res.status(500).json({ error: 'Could not load the gallery.' })
  }
}
