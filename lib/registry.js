const { createHash, randomUUID } = require('node:crypto')

const REGISTRY_URL = 'https://www.bloomingdales.com/registry/Rory-Glantz-Nathan-Pedowitz/1918053'
const REGISTRY_API_URL = 'https://www.bloomingdales.com/regsvc/registry/api/v1/preference/getPreference?orgId=13&registryId=1918053&productInfoFlag=true'
const REFRESH_SECONDS = 3600
let cachedCatalog
let pendingRefresh

async function fetchRegistrySource() {
  const response = await fetch(REGISTRY_URL, {
    headers: { Accept: 'text/html,application/xhtml+xml' },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`Bloomingdale’s registry returned HTTP ${response.status}`)
  return response.text()
}

function publicBootstrapKey(html) {
  for (const script of html.matchAll(/<script\b[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    if (!script[1].includes('googleSecrets')) continue
    const values = JSON.parse(script[1])
    const root = values[1]
    const pinia = values[root?.pinia]
    const store = values[pinia?.googleSecrets]
    const key = values[store?.xMacysApiKey]
    if (typeof key === 'string' && key.length) return key
  }
  throw new Error('The public registry bootstrap configuration was not available')
}

function money(value) {
  if (value === null || value === undefined || value === '') return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function normalizeRegistry(info) {
  if (String(info?.registryId) !== '1918053' || !Array.isArray(info.registryItems) || info.registryItems.length !== Number(info.totalItems)) {
    throw new Error('The complete registry was not returned')
  }
  const ids = new Set()
  const products = info.registryItems.map(item => {
    const product = item.productInfo
    const upc = product?.upc
    const price = upc?.price?.[0]
    const availability = upc?.networkAvailability?.[0]
    const image = product?.imageDetails?.primaryPortraitSource || upc?.colorway?.primaryImage?.imageName
    const quantities = [item.quantityRequested, item.quantityPurchased, item.quantityOpen].map(Number)
    const id = String(item.registryItemGUID || '')
    if (!id || ids.has(id) || !product?.productId || !upc?.upcName || !image || !quantities.every(n => Number.isInteger(n) && n >= 0)) {
      throw new Error('A registry product was incomplete')
    }
    ids.add(id)
    const sale = money(price?.saleValue)
    const onSale = price?.onSale === true || price?.onSale === 'true'
    const productUrl = new URL(product.url?.canonicalProductUrl || product.url?.productUrl || REGISTRY_URL, 'https://www.bloomingdales.com')
    if (productUrl.origin !== 'https://www.bloomingdales.com') throw new Error('Invalid registry product origin')
    return {
      id,
      productId: String(product.productId),
      upcId: String(upc.upcId),
      brand: upc.brandName || '',
      name: upc.upcName,
      imageUrl: `https://slimages.macysassets.com/is/image/BLM/products/${image}.tif?fmt=jpeg&wid=1000&hei=1250&qlt=90`,
      productUrl: productUrl.href,
      registryUrl: REGISTRY_URL,
      categories: Array.from(product.filterCategories || []),
      price: onSale && sale > 0 ? sale : money(price?.retailPrice),
      originalPrice: money(price?.originalPrice),
      requested: quantities[0],
      purchased: quantities[1],
      remaining: quantities[2],
      available: typeof availability?.available === 'boolean' ? availability.available : null,
      lowStock: availability?.lowAvailable === true,
      fulfillmentChannel: availability?.fulfillmentChannel || null,
      discontinued: upc.discontinuedCode === 'Y',
    }
  })
  const version = catalogVersion(products)
  return { registryId: '1918053', registryUrl: REGISTRY_URL, products, version, checkedAt: new Date().toISOString() }
}

function catalogVersion(products) {
  return createHash('sha256').update(JSON.stringify([...products].sort((a, b) => a.id.localeCompare(b.id)))).digest('hex')
}

async function scrapeRegistry() {
  const key = publicBootstrapKey(await fetchRegistrySource())
  const response = await fetch(REGISTRY_API_URL, {
    headers: { Accept: 'application/json', 'x-macys-apikey': key, 'x-macys-request-id': randomUUID() },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`Bloomingdale’s registry data returned HTTP ${response.status}`)
  const body = await response.json()
  return normalizeRegistry(body.registryInfo)
}

async function getRegistryCatalog() {
  if (cachedCatalog && Date.now() - Date.parse(cachedCatalog.checkedAt) < REFRESH_SECONDS * 1000) return cachedCatalog
  if (!pendingRefresh) {
    pendingRefresh = scrapeRegistry().then(catalog => {
      cachedCatalog = catalog
      return catalog
    }).finally(() => { pendingRefresh = undefined })
  }
  return pendingRefresh
}

module.exports = { REGISTRY_URL, REFRESH_SECONDS, fetchRegistrySource, catalogVersion, normalizeRegistry, scrapeRegistry, getRegistryCatalog }
