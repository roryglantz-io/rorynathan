import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/Layout'
import config from '../lib/config'

export default function Home() {
  const calendarDate = config.weddingDate.slice(0, 10)
  const [year, month, day] = calendarDate.split('-')
  const { proposal, portrait, together, sunset } = config.photos

  return (
    <Layout>
      <section className="invitation" aria-labelledby="couple-names">
        <h1 id="couple-names" className="sr-only">{config.coupleNames} wedding</h1>
        <header className="invitation__masthead">
          <p className="invitation__title">Save <span>the</span> Date</p>
          <p className="invitation__names">{config.coupleNames}</p>
          <time dateTime={calendarDate}>{month}.{day}.{year}</time>
          <p className="invitation__place">{config.location.toUpperCase()}</p>
        </header>
        <figure className="invitation__photo">
          <Image src={proposal.src} alt={proposal.alt} fill sizes="(max-width: 760px) calc(100vw - 48px), (min-width: 1296px) 760px, 60vw" quality={90} priority />
        </figure>
      </section>

      <section className="home-details" aria-label="Wedding details and registry">
        <div className="home-details__column">
          <p className="home-details__label">Details</p>
          <p>We’re still finalizing the details.<br />We’ll share more here soon.</p>
          <Link href="/details" className="home-details__link">View details</Link>
        </div>
        <figure className="home-details__photo">
          <Image src={sunset.src} alt={sunset.alt} fill sizes="(max-width: 760px) calc(100vw - 48px), 360px" quality={90} />
        </figure>
        <div className="home-details__column">
          <p className="home-details__label">Registry</p>
          <p>Our registry is at Bloomingdale’s.</p>
          <Link href="/registry" className="home-details__link">View registry</Link>
        </div>
      </section>

      <section className="home-gallery" aria-label="Engagement photographs">
        <figure>
          <Image src={portrait.src} alt={portrait.alt} fill sizes="(max-width: 760px) 100vw, 50vw" quality={90} />
        </figure>
        <figure>
          <Image src={together.src} alt={together.alt} fill sizes="(max-width: 760px) 100vw, 50vw" quality={90} />
        </figure>
      </section>
    </Layout>
  )
}
