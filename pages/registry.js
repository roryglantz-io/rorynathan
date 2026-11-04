import { useEffect, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import Layout from '../components/Layout'
import config from '../lib/config'

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const FRESHNESS_MS = 60 * 60 * 1000

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

  useEffect(() => {
    const remaining = Date.parse(catalog.checkedAt) + FRESHNESS_MS - Date.now()
    setFresh(remaining > 0)
    if (remaining <= 0) return
    const timer = setTimeout(() => setFresh(false), remaining)
    return () => clearTimeout(timer)
  }, [catalog.checkedAt])

  return (
    <Layout title="Registry" description={`Registry for ${config.coupleNames}.`}>
      <section className="registry-catalogpage" aria-labelledby="registry-title">
        <header className="registry-catalogpage__heading">
          <h1 id="registry-title">Registry</h1>
          <div className="registry-links">
            {config.registry.links.map(item => (
              <a className="text-link" href={item.url} target="_blank" rel="noopener noreferrer" key={item.url}>
                {item.name}
                <span className="sr-only"> registry (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </header>
        <ul className="registry-grid">
          {catalog.products.map(product => {
            const gifted = fresh && product.requested > 0 && product.purchased >= product.requested
            const status = !fresh ? null : gifted ? 'Gifted' : product.available === false ? 'Check availability' : product.fulfillmentChannel === 'ORDR' ? 'On order' : product.lowStock ? 'Low stock' : null

            return (
              <li className="registry-item" key={product.id}>
                <figure className="registry-item__image">
                  <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 360px) calc(100vw - 48px), (max-width: 760px) calc(50vw - 32px), (max-width: 1000px) calc(50vw - 60px), (min-width: 1296px) 379px, calc(33.333vw - 53.333px)" quality={90} />
                </figure>
                <div className="registry-item__copy">
                  {product.brand && <p className="registry-item__brand">{product.brand}</p>}
                  <h2 className="registry-item__title">{product.name}</h2>
                  {product.price !== null && (
                    <p className="registry-item__price">
                      {product.originalPrice > product.price && <><span className="sr-only">Original price: </span><s>{priceFormatter.format(product.originalPrice)}</s>{' '}</>}
                      {product.originalPrice > product.price && <span className="sr-only">Sale price: </span>}
                      {priceFormatter.format(product.price)}
                    </p>
                  )}
                  {fresh && product.purchased > 0 && <p className="registry-item__quantity">{product.purchased} of {product.requested} purchased</p>}
                  {status && <p className="registry-item__status">{status}</p>}
                  {!gifted && <a className="text-link registry-item__link" href={product.registryUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open our Bloomingdale’s registry to shop for ${product.name} (opens in a new tab)`}>View registry</a>}
                </div>
              </li>
            )
          })}
        </ul>
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
