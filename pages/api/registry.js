import { getRegistryCatalog, catalogVersion } from '../../lib/registry'

export const config = { runtime: 'edge' }

const PUBLISHED_CATALOG_URL = 'https://raw.githubusercontent.com/roryglantz-io/rorynathan/main/lib/registry-catalog.json'
let fallbackCatalog

async function savedCatalog() {
  if (fallbackCatalog) return fallbackCatalog
  const response = await fetch(PUBLISHED_CATALOG_URL, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
  if (!response.ok) throw new Error(`Saved registry returned HTTP ${response.status}`)
  const catalog = await response.json()
  if (catalog.registryId !== '1918053' || !Array.isArray(catalog.products) || !catalog.products.length) {
    throw new Error('Saved registry was invalid')
  }
  fallbackCatalog = { ...catalog, version: await catalogVersion(catalog.products) }
  return fallbackCatalog
}

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { Allow: 'GET', 'Content-Type': 'application/json' } })
  }

  let catalog
  try {
    catalog = await getRegistryCatalog()
  } catch (error) {
    console.error('Registry refresh failed:', error?.message || 'Unknown error')
    catalog = await savedCatalog()
  }

  const etag = `"${catalog.version}"`
  if (req.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } })
  }

  return new Response(JSON.stringify(catalog), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60',
      ETag: etag,
      'X-Registry-Checked-At': catalog.checkedAt,
    },
  })
}
