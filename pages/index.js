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
        <header className="invitation__masthead">
          <h1 id="couple-names" className="invitation__names">{config.couple.partnerOne} <span>&amp;</span> {config.couple.partnerTwo}</h1>
          <div className="invitation__meta">
            <time dateTime={calendarDate}>{month}.{day}.{year}</time>
            <p className="invitation__place">{config.location}</p>
          </div>
        </header>
        <div className="invitation__gallery">
          <figure className="invitation__photo invitation__photo--proposal">
            <Image src={proposal.src} alt={proposal.alt} fill sizes="(max-width: 760px) calc(50vw - 30px), (min-width: 1296px) 318px, 26vw" quality={90} loading="eager" />
          </figure>
          <figure className="invitation__photo invitation__photo--portrait">
            <Image src={portrait.src} alt={portrait.alt} fill sizes="(max-width: 760px) calc(100vw - 48px), (min-width: 1296px) 516px, 43vw" quality={90} priority />
          </figure>
          <figure className="invitation__photo invitation__photo--together">
            <Image src={together.src} alt={together.alt} fill sizes="(max-width: 760px) calc(50vw - 30px), (min-width: 1296px) 318px, 26vw" quality={90} loading="eager" />
          </figure>
        </div>
      </section>

      <section className="home-details" aria-label="Wedding details and registry">
        <div className="home-details__column">
          <h2 className="home-details__label">Details</h2>
          <p>We’re still finalizing the details.<br />We’ll share more here soon.</p>
          <Link href="/details" className="home-details__link">View details</Link>
        </div>
        <figure className="home-details__photo">
          <Image src={sunset.src} alt={sunset.alt} fill sizes="(max-width: 468px) calc(100vw - 48px), (max-width: 760px) 420px, 360px" quality={90} />
        </figure>
        <div className="home-details__column">
          <h2 className="home-details__label"><Link href="/registry">Registry</Link></h2>
        </div>
      </section>
    </Layout>
  )
}
