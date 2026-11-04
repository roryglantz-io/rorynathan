import { catalogVersion, savedCatalog } from '../../lib/registry'

const PUBLISHED_CATALOG_URL = 'https://raw.githubusercontent.com/roryglantz-io/rorynathan/main/lib/registry-catalog.json'
let cached

async function publishedCatalog() {
  if (cached && Date.now() - Date.parse(cached.checkedAt) < 60 * 60 * 1000) return cached
  const response = await fetch(PUBLISHED_CATALOG_URL, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
  if (!response.ok) throw new Error(`Published registry returned HTTP ${response.status}`)
  const catalog = await response.json()
  if (catalog.registryId !== '1918053' || !Array.isArray(catalog.products) || !catalog.products.length) {
    throw new Error('Published registry was invalid')
  }
  cached = { ...catalog, version: catalogVersion(catalog.products) }
  return cached
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let catalog
  try {
    catalog = await publishedCatalog()
  } catch (error) {
    console.error('Published registry unavailable:', error?.message || 'Unknown error')
    catalog = savedCatalog()
  }

  const etag = `"${catalog.version}"`
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60')
  res.setHeader('ETag', etag)
  res.setHeader('X-Registry-Checked-At', catalog.checkedAt)
  if (req.headers['if-none-match'] === etag) return res.status(304).end()
  return res.status(200).json(catalog)
}
