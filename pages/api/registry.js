import { getRegistryCatalog, savedCatalog, REFRESH_SECONDS } from '../../lib/registry'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let catalog
  try {
    catalog = await getRegistryCatalog()
  } catch (error) {
    console.error('Registry refresh failed:', error?.message || 'Unknown error')
    catalog = savedCatalog()
  }

  const etag = catalog.version !== undefined && catalog.checkedAt === undefined ? `"saved-${catalog.version}"` : `"${catalog.version}"`
  res.setHeader('Cache-Control', `public, max-age=0, s-maxage=${catalog.checkedAt ? REFRESH_SECONDS : 60}, stale-while-revalidate=60`)
  res.setHeader('ETag', etag)
  res.setHeader('X-Registry-Checked-At', catalog.checkedAt)
  if (req.headers['if-none-match'] === etag) return res.status(304).end()
  return res.status(200).json(catalog)
}
