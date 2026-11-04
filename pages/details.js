import Image from 'next/image'
import Layout from '../components/Layout'
import config from '../lib/config'

export default function Details() {
  const photo = config.photos.sunset

  return (
    <Layout title="Details" description={`Wedding details for ${config.coupleNames}, ${config.weddingDateLabel} in ${config.location}.`}>
      <section className="information-page" aria-labelledby="details-title">
        <div className="information-page__copy">
          <h1 id="details-title">Details</h1>
          <p className="information-page__intro">We’re still finalizing the details.<br />We’ll share more here soon.</p>
          <div className="event-meta event-meta--stacked">
            <time dateTime={config.weddingDate.slice(0, 10)}>{config.weddingDateLabel}</time>
            <span>{config.location}</span>
          </div>
        </div>
        <figure className="information-page__photo">
          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 760px) calc(100vw - 48px), (min-width: 1296px) 540px, 45vw" quality={90} priority />
        </figure>
      </section>
    </Layout>
  )
}
