import { getDb } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sql = getDb()
      const posts = await sql`
        SELECT id, author_name, message, image_url, created_at
        FROM guestbook_posts
        WHERE approved = TRUE
        ORDER BY created_at DESC
        LIMIT 300
      `
      return res.status(200).json({ posts })
    } catch (err) {
      console.error('Guestbook read error:', err)
      return res.status(500).json({ error: 'Could not load the guestbook.' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { authorName, message, imageUrl } = req.body || {}

      if (!authorName || !String(authorName).trim()) {
        return res.status(400).json({ error: 'Please add your name.' })
      }
      if (!message || !String(message).trim()) {
        return res.status(400).json({ error: 'Please write a message.' })
      }

      // Only accept an image URL our own upload endpoint produced. Otherwise
      // anyone can point the page at an arbitrary host.
      let safeImageUrl = null
      if (imageUrl) {
        const url = String(imageUrl)
        if (!/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url)) {
          return res.status(400).json({ error: 'Invalid image. Please upload it again.' })
        }
        safeImageUrl = url
      }

      const sql = getDb()
      const rows = await sql`
        INSERT INTO guestbook_posts (author_name, message, image_url)
        VALUES (
          ${String(authorName).trim().slice(0, 120)},
          ${String(message).trim().slice(0, 2000)},
          ${safeImageUrl}
        )
        RETURNING id, author_name, message, image_url, created_at
      `

      return res.status(201).json({ post: rows[0] })
    } catch (err) {
      console.error('Guestbook write error:', err)
      return res.status(500).json({ error: 'Could not save your message. Please try again.' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
