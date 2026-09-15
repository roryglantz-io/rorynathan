import Link from 'next/link'
import Layout from '../components/Layout'
import Countdown from '../components/Countdown'
import PhotoStrip from '../components/PhotoStrip'
import config from '../lib/config'

export default function Home() {
  // While the venue is unsettled these cards would all read "to be confirmed",
  // which is worse than not showing them. Each one appears once it has
  // something to say.
  const hasVenue = config.venues.some(v => v.address)
  const hasDressCode = Boolean(config.dressCode.detail)
  const showCards = hasVenue || hasDressCode

  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">We&rsquo;re getting married!</p>
        <h1 className="hero__names">
          {config.couple.partnerOne}
          <span className="hero__amp">and</span>
          {config.couple.partnerTwo}
        </h1>
        <hr className="rule" />
        <p className="hero__meta">{config.weddingDateLabel}</p>
        {config.location && <p className="hero__meta" style={{ marginTop: 8 }}>{config.location}</p>}

        <Countdown />

        <Link href="/rsvp" className="btn">RSVP</Link>
      </section>

      <PhotoStrip />

      {showCards && (
        <section className="section section--alt">
          <div className="inner center" style={{ marginBottom: 48 }}>
            <p className="eyebrow">The short version</p>
            <h2>When &amp; where</h2>
            <hr className="rule" />
          </div>

          <div className="inner cards">
            {hasVenue && config.venues.map(v => (
              <article className="card" key={v.venue + v.name}>
                <p className="eyebrow" style={{ marginBottom: 10 }}>{v.name}</p>
                <h3>{v.venue}</h3>
                <p className="card__meta">{v.address}</p>
                {v.mapQuery && (
                  <p className="card__meta" style={{ marginTop: 14 }}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mapQuery)}`} target="_blank" rel="noopener noreferrer">
                      Open in Maps &rarr;
                    </a>
                  </p>
                )}
              </article>
            ))}

            {hasDressCode && (
              <article className="card">
                <p className="eyebrow" style={{ marginBottom: 10 }}>Dress code</p>
                <h3>{config.dressCode.label}</h3>
                <p className="card__meta" style={{ marginTop: 10 }}>{config.dressCode.detail}</p>
              </article>
            )}

            {config.rsvpDeadlineLabel && (
              <article className="card">
                <p className="eyebrow" style={{ marginBottom: 10 }}>Please reply by</p>
                <h3>{config.rsvpDeadlineLabel}</h3>
                <p className="card__meta" style={{ marginTop: 10 }}>
                  The caterer needs final numbers, and we&rsquo;d love to know you&rsquo;re coming.
                </p>
                <p className="card__meta" style={{ marginTop: 14 }}>
                  <Link href="/rsvp">Reply now &rarr;</Link>
                </p>
              </article>
            )}
          </div>
        </section>
      )}

      <section className="section">
        <div className="inner inner--prose center">
          <p className="eyebrow">Where things stand</p>
          <h2>Save the date &mdash; soon</h2>
          <hr className="rule" />
          <p style={{ color: 'var(--ink-soft)' }}>
            We haven&rsquo;t settled on a date or a place yet. As soon as we do, this page
            is where you&rsquo;ll hear it first.
          </p>
          <p style={{ color: 'var(--ink-soft)' }}>
            In the meantime, you can leave us your details so we know how to reach you.
          </p>
          <Link href="/rsvp" className="btn btn--ghost" style={{ marginTop: 10 }}>
            Leave your details
          </Link>
        </div>
      </section>
    </Layout>
  )
}
