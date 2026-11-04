import { getRegistryCatalog, REFRESH_SECONDS } from '../../lib/registry'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const catalog = await getRegistryCatalog()
    const etag = `"${catalog.version}"`
    res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${REFRESH_SECONDS}, stale-while-revalidate=60`)
    res.setHeader('ETag', etag)
    res.setHeader('X-Registry-Checked-At', catalog.checkedAt)
    if (req.headers['if-none-match'] === etag) return res.status(304).end()
    const { checkedAt, ...body } = catalog
    return res.status(200).json(body)
  } catch {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(503).json({ error: 'Registry availability could not be refreshed' })
  }
}
