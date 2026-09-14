import useSWR from 'swr'
import Layout from '../components/Layout'
import config from '../lib/config'

const fetcher = url => fetch(url).then(r => r.json())

export default function Gallery() {
  const { data, error, isLoading } = useSWR('/api/gallery', fetcher)
  const photos = data?.photos || []

  return (
    <Layout title="Photos" description={`Photos of ${config.coupleNames}.`}>
      <section className="section">
        <div className="inner center" style={{ marginBottom: 48 }}>
          <p className="eyebrow">A few of our favourites</p>
          <h2>Photos</h2>
          <hr className="rule" />
        </div>

        <div className="inner">
          {isLoading && <p className="center" style={{ color: 'var(--ink-faint)' }}>Loading&hellip;</p>}

          {error && (
            <div className="alert alert--error">Couldn&rsquo;t load the photos. Please refresh.</div>
          )}

          {!isLoading && !error && photos.length === 0 && (
            <p className="center" style={{ color: 'var(--ink-faint)' }}>
              Photos are on their way — check back soon.
            </p>
          )}

          {photos.length > 0 && (
            <div className="gallery">
              {photos.map(photo => (
                <figure className="gallery__item" key={photo.id}>
                  <img src={photo.image_url} alt={photo.caption || ''} loading="lazy" />
                  {photo.caption && <figcaption className="gallery__caption">{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
