import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/Layout'
import config from '../lib/config'

export default function Home() {
  const { proposal, portrait, together, wide, laughing } = config.photos
  const calendarDate = config.weddingDate.slice(0, 10)
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'America/New_York' }).format(config.weddingDateObj)

  return (
    <Layout>
      <section className="opening" aria-labelledby="couple-names">
        <div className="opening__masthead">
          <p>We’re getting married</p>
          <h1 id="couple-names">{config.couple.partnerOne} <span>&amp;</span> {config.couple.partnerTwo}</h1>
          <div className="opening__date">
            <p><time dateTime={calendarDate}>{config.weddingDateLabel}</time></p>
            <p>{config.location}</p>
          </div>
        </div>

        <div className="photo-stack" aria-label="Our engagement">
          <figure className="photo-stack__photo photo-stack__photo--left">
            <Image src={laughing.src} alt={laughing.alt} fill sizes="(max-width: 760px) 36vw, (min-width: 1268px) 391px, 32vw" quality={90} priority />
          </figure>
          <figure className="photo-stack__photo photo-stack__photo--right">
            <Image src={together.src} alt={together.alt} fill sizes="(max-width: 760px) 36vw, (min-width: 1268px) 391px, 32vw" quality={90} priority />
          </figure>
          <figure className="photo-stack__photo photo-stack__photo--center">
            <Image src={proposal.src} alt={proposal.alt} fill sizes="(max-width: 760px) 48vw, (min-width: 1268px) 501px, 41vw" quality={90} priority />
          </figure>
        </div>
        <a href="#save-the-date" className="opening__scroll">A little more below <span aria-hidden="true">↓</span></a>
      </section>

      <section className="date-story" id="save-the-date" aria-labelledby="date-story-title">
        <div className="date-story__intro">
          <p>Save the date</p>
          <h2 id="date-story-title">We can’t wait<br />to celebrate with you.</h2>
        </div>
        <div className="date-story__composition">
          <div className="date-story__side date-story__side--date">
            <p className="date-story__full-date"><time dateTime={calendarDate}>{weekday},<br />{config.weddingDateLabel}</time></p>
          </div>
          <figure className="date-story__photo">
            <div className="date-story__image">
              <Image src={portrait.src} alt={portrait.alt} fill sizes="(max-width: 488px) calc(100vw - 48px), (max-width: 760px) 440px, (min-width: 1440px) 575px, 38vw" quality={90} />
            </div>
          </figure>
          <div className="date-story__side date-story__side--place">
            <p className="date-story__large">{config.place.city}</p>
            <p>{config.place.state}</p>
            <p className="date-story__note">The details are still coming together.<br />The date is yours to save.</p>
            <Link href="/details" className="text-link">Wedding details</Link>
          </div>
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <figure className="closing__photo">
          <Image src={wide.src} alt={wide.alt} fill sizes="(max-width: 760px) 94vw, (min-width: 1440px) 780px, 60vw" quality={90} />
        </figure>
        <div className="closing__copy">
          <h2 id="closing-title">With love,<br />{config.coupleNames}</h2>
          <p>More to come. For now, we’re just happy you’re here.</p>
          <Link href="/registry" className="text-link">Our registry</Link>
        </div>
      </section>
    </Layout>
  )
}
