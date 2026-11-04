import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import Layout from '../components/Layout'
import config from '../lib/config'

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const FRESHNESS_MS = 60 * 60 * 1000

const CATEGORY_OPTIONS = [
  'Dining & Serveware',
  'Bar & Wine Accessories',
  'Kitchen',
  'Home Decor',
  'Bed & Bath',
  'Luggage',
  'Cleaning & Organizing',
  'Furniture',
]

const STATUS_OPTIONS = [
  { value: 'purchased', label: 'Purchased' },
  { value: 'needed', label: 'Still needed' },
  { value: 'unavailable', label: 'Unavailable' },
]

const PRICE_OPTIONS = [
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50–$100' },
  { value: '100-250', label: '$100–$250' },
  { value: '250-500', label: '$250–$500' },
  { value: '500-plus', label: '$500 & Above' },
]

function categoryNames(product) {
  return product.categories.map(category => category === 'Home' ? 'Home Decor' : category)
}

function isPurchased(product) {
  return product.requested > 0 && product.purchased >= product.requested
}

function inPriceRange(price, range, customMin, customMax) {
  if (price === null) return false
  if (range === 'under-50') return price < 50
  if (range === '50-100') return price >= 50 && price < 100
  if (range === '100-250') return price >= 100 && price < 250
  if (range === '250-500') return price >= 250 && price < 500
  if (range === '500-plus') return price >= 500
  if (range === 'custom') {
    return (customMin === null || price >= customMin) && (customMax === null || price <= customMax)
  }
  return true
}

async function fetchCatalog(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Registry refresh failed')
  const catalog = await response.json()
  if (catalog.registryId !== '1918053' || !Array.isArray(catalog.products)) throw new Error('Invalid registry response')
  return { ...catalog, checkedAt: response.headers.get('x-registry-checked-at') || catalog.checkedAt }
}

export default function Registry({ initialCatalog, initiallyFresh }) {
  const { data: catalog } = useSWR('/api/registry', fetchCatalog, {
    fallbackData: initialCatalog,
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })
  const [fresh, setFresh] = useState(initiallyFresh)
  const [categories, setCategories] = useState([])
  const [statuses, setStatuses] = useState([])
  const [priceRange, setPriceRange] = useState('all')
  const [customMin, setCustomMin] = useState('')
  const [customMax, setCustomMax] = useState('')
  const [appliedMin, setAppliedMin] = useState(null)
  const [appliedMax, setAppliedMax] = useState(null)
  const [priceError, setPriceError] = useState('')
  const [sort, setSort] = useState('recent')
  const [perPage, setPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const remaining = Date.parse(catalog.checkedAt) + FRESHNESS_MS - Date.now()
    setFresh(remaining > 0)
    if (remaining <= 0) return
    const timer = setTimeout(() => setFresh(false), remaining)
    return () => clearTimeout(timer)
  }, [catalog.checkedAt])

  function toggleCategory(category) {
    setCategories(list => list.includes(category) ? list.filter(item => item !== category) : [...list, category])
    setPage(1)
  }

  function toggleStatus(status) {
    setStatuses(list => list.includes(status) ? list.filter(item => item !== status) : [...list, status])
    setPage(1)
  }

  function choosePrice(range) {
    setPriceRange(range)
    setPage(1)
  }

  function applyCustomRange(event) {
    event.preventDefault()
    const min = customMin === '' ? null : Number(customMin)
    const max = customMax === '' ? null : Number(customMax)
    if ((min !== null && (!Number.isFinite(min) || min < 0)) || (max !== null && (!Number.isFinite(max) || max < 0))) {
      setPriceError('Enter a valid price.')
      return
    }
    if (min !== null && max !== null && min > max) {
      setPriceError('The minimum must not exceed the maximum.')
      return
    }
    setPriceError('')
    setAppliedMin(min)
    setAppliedMax(max)
    setPriceRange('custom')
    setPage(1)
  }

  function clearFilters() {
    setCategories([])
    setStatuses([])
    setPriceRange('all')
    setCustomMin('')
    setCustomMax('')
    setAppliedMin(null)
    setAppliedMax(null)
    setPriceError('')
    setSort('recent')
    setPerPage(20)
    setPage(1)
  }

  const filtered = useMemo(() => {
    const filteredProducts = catalog.products.filter(product => {
      if (categories.length && !categoryNames(product).some(category => categories.includes(category))) return false
      if (priceRange !== 'all' && !inPriceRange(product.price, priceRange, appliedMin, appliedMax)) return false
      if (statuses.length) {
        const matches = statuses.some(status => {
          if (status === 'purchased') return isPurchased(product)
          if (status === 'needed') return product.remaining > 0
          return product.available === false
        })
        if (!matches) return false
      }
      return true
    })
    if (sort === 'price-low') return [...filteredProducts].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    if (sort === 'price-high') return [...filteredProducts].sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity))
    return filteredProducts
  }, [catalog.products, categories, statuses, priceRange, appliedMin, appliedMax, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)
  const activeFilterCount = categories.length + statuses.length + (priceRange === 'all' ? 0 : 1)

  return (
    <Layout title="Registry" description={`Registry for ${config.coupleNames}.`}>
      <section className="registry-catalogpage" aria-labelledby="registry-title">
        <header className="registry-catalogpage__heading">
          <h1 id="registry-title">Registry</h1>
        </header>

        <div className="registry-layout">
          <button
            type="button"
            className="registry-filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls="registry-filters"
            onClick={() => setFiltersOpen(open => !open)}
          >
            {filtersOpen ? 'Hide filters' : `Filter${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
          </button>

          <aside id="registry-filters" className={`registry-filters${filtersOpen ? ' registry-filters--open' : ''}`} aria-label="Filter registry">
            <form onSubmit={applyCustomRange}>
              <fieldset className="registry-filter-group">
                <legend>Category</legend>
                {CATEGORY_OPTIONS.map(category => (
                  <label className="registry-filter-option" key={category}>
                    <input type="checkbox" checked={categories.includes(category)} onChange={() => toggleCategory(category)} />
                    <span>{category}</span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="registry-filter-group">
                <legend>Status</legend>
                {STATUS_OPTIONS.map(option => (
                  <label className="registry-filter-option" key={option.value}>
                    <input type="checkbox" checked={statuses.includes(option.value)} onChange={() => toggleStatus(option.value)} />
                    <span>{option.label}</span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="registry-filter-group">
                <legend>Price</legend>
                <label className="registry-filter-option">
                  <input type="radio" name="registry-price" value="all" checked={priceRange === 'all'} onChange={() => choosePrice('all')} />
                  <span>Any price</span>
                </label>
                {PRICE_OPTIONS.map(option => (
                  <label className="registry-filter-option" key={option.value}>
                    <input type="radio" name="registry-price" value={option.value} checked={priceRange === option.value} onChange={() => choosePrice(option.value)} />
                    <span>{option.label}</span>
                  </label>
                ))}
                <label className="registry-filter-option">
                  <input type="radio" name="registry-price" value="custom" checked={priceRange === 'custom'} onChange={() => choosePrice('custom')} />
                  <span>Custom range</span>
                </label>
                <div className="registry-price-range">
                  <label>Min <input type="number" min="0" step="1" inputMode="decimal" value={customMin} onChange={event => setCustomMin(event.target.value)} /></label>
                  <span>to</span>
                  <label>Max <input type="number" min="0" step="1" inputMode="decimal" value={customMax} onChange={event => setCustomMax(event.target.value)} /></label>
                  <button type="submit" className="registry-price-go">Go</button>
                </div>
                {priceError && <p className="registry-filter-error" role="alert">{priceError}</p>}
              </fieldset>
            </form>

            {activeFilterCount > 0 && (
              <button type="button" className="registry-clear" onClick={clearFilters}>Clear all</button>
            )}
          </aside>

          <div className="registry-results">
            <div className="registry-toolbar">
              <p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'gift' : 'gifts'}</p>
              <div className="registry-toolbar__controls">
                <label>
                  Sort
                  <select value={sort} onChange={event => { setSort(event.target.value); setPage(1) }}>
                    <option value="recent">Recently added</option>
                    <option value="price-low">Price (low–high)</option>
                    <option value="price-high">Price (high–low)</option>
                  </select>
                </label>
                <label>
                  Show
                  <select value={perPage} onChange={event => { setPerPage(Number(event.target.value)); setPage(1) }}>
                    <option value={20}>20</option>
                    <option value={40}>40</option>
                  </select>
                </label>
              </div>
            </div>

            {visible.length > 0 ? (
              <ul className="registry-grid">
                {visible.map(product => {
                  const gifted = fresh && isPurchased(product)
                  const status = !fresh ? null : gifted ? 'Purchased' : product.available === false ? 'Unavailable' : product.fulfillmentChannel === 'ORDR' ? 'On order' : product.lowStock ? 'Limited-time availability' : null

                  return (
                    <li className="registry-item" key={product.id}>
                      <figure className="registry-item__image">
                        <Link href={product.productUrl} target="_blank" rel="noopener" referrerPolicy="origin" aria-label={`Shop ${product.name} at Bloomingdale’s (opens in a new tab)`}>
                          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 360px) calc(100vw - 48px), (max-width: 760px) calc(50vw - 32px), (max-width: 1000px) calc(50vw - 60px), (max-width: 1500px) 250px, 300px" quality={90} />
                        </Link>
                      </figure>
                      <div className="registry-item__copy">
                        {product.brand && <p className="registry-item__brand">{product.brand}</p>}
                        <h2 className="registry-item__title"><Link href={product.productUrl} target="_blank" rel="noopener" referrerPolicy="origin">{product.name}</Link></h2>
                        {product.price !== null && (
                          <p className="registry-item__price">
                            {product.originalPrice > product.price && <><span className="sr-only">Original price: </span><s>{priceFormatter.format(product.originalPrice)}</s>{' '}</>}
                            {product.originalPrice > product.price && <span className="sr-only">Sale price: </span>}
                            {priceFormatter.format(product.price)}
                          </p>
                        )}
                        {fresh && product.purchased > 0 && <p className="registry-item__quantity">{product.purchased} of {product.requested} purchased</p>}
                        {status && <p className="registry-item__status">{status}</p>}
                        {!gifted && (
                          <Link className="registry-item__shop" href={product.productUrl} target="_blank" rel="noopener" referrerPolicy="origin">
                            Shop this gift<span className="sr-only"> at Bloomingdale’s (opens in a new tab)</span>
                          </Link>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="registry-empty">No gifts match these filters.</p>
            )}

            {pageCount > 1 && (
              <nav className="registry-pagination" aria-label="Registry pages">
                <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {pageCount}</span>
                <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount}>Next</button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  const initialCatalog = require('../lib/registry-catalog.json')
  return {
    props: {
      initialCatalog,
      initiallyFresh: Date.now() < Date.parse(initialCatalog.checkedAt) + FRESHNESS_MS,
    },
  }
}
