import { put } from '@vercel/blob'

// Base64 payloads inflate by ~33%, so the body limit sits above the 8MB file cap.
export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
const MAX_BYTES = 8 * 1024 * 1024

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { image } = req.body || {}
    if (!image) return res.status(400).json({ error: 'No image provided.' })

    const matches = String(image).match(/^data:(.+?);base64,(.+)$/)
    if (!matches) return res.status(400).json({ error: 'Invalid image format.' })

    const mimeType = matches[1].toLowerCase()
    if (!ALLOWED.includes(mimeType)) {
      return res.status(400).json({ error: 'Please upload a JPG, PNG, WEBP or GIF.' })
    }

    const buffer = Buffer.from(matches[2], 'base64')
    if (buffer.length > MAX_BYTES) {
      return res.status(400).json({ error: 'That image is over 8MB. Please pick a smaller one.' })
    }

    const ext = mimeType.split('/')[1].replace('jpeg', 'jpg')
    const name = `wedding/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const blob = await put(name, buffer, { access: 'public', contentType: mimeType })

    return res.status(200).json({ url: blob.url })
  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: 'Image upload failed.' })
  }
}
