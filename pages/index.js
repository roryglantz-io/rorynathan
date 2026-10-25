import Link from 'next/link'
import Layout from '../components/Layout'
import Countdown from '../components/Countdown'
import PhotoStrip from '../components/PhotoStrip'
import config from '../lib/config'

function Ornament() {
  return (
    <svg className="ornament" width="72" height="20" viewBox="0 0 72 20" aria-hidden="true">
      <path d="M0 10h27" stroke="currentColor" strokeWidth="1" />
      <path d="M45 10h27" stroke="currentColor" strokeWidth="1" />
      <path d="M36 3l4 7-4 7-4-7z" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export default function Home() {
  const venues = config.venues.filter(venue => venue.address)

  return (
    <Layout>
      <section className="hero" aria-labelledby="couple-names">
        <div className="hero__card">
          <p className="hero__opening">Together with our families, we invite you to celebrate the wedding of</p>
          <h1 className="hero__names" id="couple-names">
            <span>{config.couple.partnerOne}</span>
            <span className="hero__amp" aria-hidden="true">&amp;</span>
            <span>{config.couple.partnerTwo}</span>
          </h1>
          <Ornament />
          <p className="hero__announcement">We’re getting married.</p>
          <div className="hero__details">
            <p>{config.weddingDateLabel}</p>
            <span aria-hidden="true">·</span>
            <p>{config.location}</p>
          </div>
          <Countdown />
          <Link href="/rsvp" className="btn">
            {config.dateTbd ? 'Stay in touch' : 'RSVP'}
          </Link>
          <p className="hero__footnote">We can’t wait to celebrate with you.</p>
        </div>
      </section>

      <section className="letter section">
        <div className="inner letter__inner">
          <div>
            <p className="eyebrow">A note from us</p>
            <h2>{config.dateTbd ? 'Some things are worth waiting for.' : 'The best day of our lives.'}</h2>
          </div>
          <div className="letter__copy">
            <p>{config.dateTbd
              ? 'The date and the place are still taking shape. One thing is certain: we want you beside us when we say “I do.”'
              : `On ${config.weddingDateLabel}, we will say “I do” surrounded by the people we love most.`}</p>
            <p>{config.dateTbd
              ? 'Leave us your details, and we will send word the moment we have news. Until then, this page is where everything will appear first.'
              : 'You will find the schedule, travel notes, and everything else you need to plan your visit right here.'}</p>
            <Link href={config.dateTbd ? '/rsvp' : '/details'} className="text-link">
              {config.dateTbd ? 'Leave your details' : 'Read the details'}
            </Link>
            <p className="letter__signature">With love, {config.coupleNames}</p>
          </div>
        </div>
      </section>

      <PhotoStrip />

      {(venues.length > 0 || config.dressCode.detail) && (
        <section className="section section--alt">
          <div className="inner section-heading center">
            <p className="eyebrow">The celebration</p>
            <h2>When &amp; where</h2>
          </div>
          <div className="venue">
            {venues.map(venue => (
              <div className="venue__block" key={venue.venue + venue.name}>
                <p className="eyebrow">{venue.name}</p>
                <h3>{venue.venue}</h3>
                <p className="venue__note">{venue.address}</p>
                {venue.mapQuery && (
                  <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapQuery)}`} target="_blank" rel="noopener noreferrer">Open in Maps</a>
                )}
              </div>
            ))}
            {config.dressCode.detail && (
              <div className="venue__block">
                <p className="eyebrow">What to wear</p>
                <h3>{config.dressCode.label}</h3>
                <p className="venue__note">{config.dressCode.detail}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section">
        <div className="inner">
          <div className="section-heading">
            <p className="eyebrow">Find your way</p>
            <h2>Everything for the day</h2>
          </div>
          <nav className="index" aria-label="Site sections">
            <Link href="/details" className="index__row">
              <span>Details &amp; travel</span>
              <span>Schedule, venue, hotels, and questions</span>
              <span aria-hidden="true">Read</span>
            </Link>
            <Link href="/registry" className="index__row">
              <span>Our registry</span>
              <span>If you would like to give something</span>
              <span aria-hidden="true">Read</span>
            </Link>
            <Link href="/rsvp" className="index__row">
              <span>{config.dateTbd ? 'Stay in touch' : 'Your reply'}</span>
              <span>{config.dateTbd ? 'Leave your details and a tentative reply' : 'Tell us who is coming and what they will eat'}</span>
              <span aria-hidden="true">Read</span>
            </Link>
          </nav>
        </div>
      </section>
    </Layout>
  )
}
