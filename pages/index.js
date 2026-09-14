import Link from 'next/link'
import Layout from '../components/Layout'
import Countdown from '../components/Countdown'
import config from '../lib/config'

export default function Home() {
  return (
    <Layout>
      <section className="hero">
        <p className="eyebrow">We&rsquo;re getting married</p>
        <h1 className="hero__names">
          {config.couple.partnerOne}
          <span className="hero__amp">and</span>
          {config.couple.partnerTwo}
        </h1>
        <hr className="rule" />
        <p className="hero__meta">{config.weddingDateLabel}</p>
        <p className="hero__meta" style={{ marginTop: 8 }}>{config.location}</p>

        <Countdown />

        <Link href="/rsvp" className="btn">RSVP</Link>
      </section>

      <section className="section">
        <div className="inner center" style={{ marginBottom: 56 }}>
          <p className="eyebrow">How we got here</p>
          <h2>Our story</h2>
          <hr className="rule" />
        </div>

        <div className="story">
          {config.story.map(item => (
            <article className="story__item" key={item.year + item.title}>
              <div className="story__year">{item.year}</div>
              <div>
                <h3>{item.title}</h3>
                <p className="story__body">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--alt">
        <div className="inner center" style={{ marginBottom: 48 }}>
          <p className="eyebrow">The short version</p>
          <h2>When &amp; where</h2>
          <hr className="rule" />
        </div>

        <div className="inner cards">
          {config.venues.map(v => (
            <article className="card" key={v.venue + v.name}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>{v.name}</p>
              <h3>{v.venue}</h3>
              <p className="card__meta">{v.address}</p>
              <p className="card__meta" style={{ marginTop: 14 }}>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mapQuery)}`} target="_blank" rel="noopener noreferrer">
                  Open in Maps &rarr;
                </a>
              </p>
            </article>
          ))}

          <article className="card">
            <p className="eyebrow" style={{ marginBottom: 10 }}>Dress code</p>
            <h3>{config.dressCode.label}</h3>
            <p className="card__meta" style={{ marginTop: 10 }}>{config.dressCode.detail}</p>
          </article>

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
        </div>

        <div className="inner center" style={{ marginTop: 48 }}>
          <Link href="/details" className="btn btn--ghost">Full details &amp; travel</Link>
        </div>
      </section>
    </Layout>
  )
}
