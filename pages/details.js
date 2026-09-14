import { useState } from 'react'
import Layout from '../components/Layout'
import config from '../lib/config'

export default function Details() {
  return (
    <Layout title="Details" description={`Schedule, venue and travel details for ${config.coupleNames}.`}>
      <section className="section">
        <div className="inner center" style={{ marginBottom: 48 }}>
          <p className="eyebrow">{config.weddingDateLabel}</p>
          <h2>The day</h2>
          <hr className="rule" />
        </div>

        <div className="schedule">
          {config.schedule.map(item => (
            <div className="schedule__row" key={item.time + item.title}>
              <div className="schedule__time">{item.time}</div>
              <div>
                <h3>{item.title}</h3>
                {item.detail && <p className="schedule__detail">{item.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--alt">
        <div className="inner center" style={{ marginBottom: 48 }}>
          <p className="eyebrow">Where to go</p>
          <h2>The venue</h2>
          <hr className="rule" />
        </div>

        <div className="inner cards">
          {config.venues.map(v => (
            <article className="card" key={v.venue + v.name}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>{v.name}</p>
              <h3>{v.venue}</h3>
              <p className="card__meta">{v.address}</p>
              {v.note && <p className="card__meta" style={{ marginTop: 12 }}>{v.note}</p>}
              <p className="card__meta" style={{ marginTop: 16 }}>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mapQuery)}`} target="_blank" rel="noopener noreferrer">
                  Directions &rarr;
                </a>
              </p>
            </article>
          ))}

          <article className="card">
            <p className="eyebrow" style={{ marginBottom: 10 }}>What to wear</p>
            <h3>{config.dressCode.label}</h3>
            <p className="card__meta" style={{ marginTop: 10 }}>{config.dressCode.detail}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="inner center" style={{ marginBottom: 48 }}>
          <p className="eyebrow">Getting here &amp; staying over</p>
          <h2>Travel</h2>
          <hr className="rule" />
          <p className="inner--prose" style={{ margin: '0 auto', color: 'var(--ink-soft)' }}>
            {config.travel.intro}
          </p>
        </div>

        <div className="inner cards">
          <article className="card">
            <p className="eyebrow" style={{ marginBottom: 14 }}>Nearest airports</p>
            {config.travel.airports.map(a => (
              <div key={a.name} style={{ marginBottom: 14 }}>
                <div>{a.name}</div>
                <div className="card__meta">{a.detail}</div>
              </div>
            ))}
          </article>

          {config.travel.hotels.map(h => (
            <article className="card" key={h.name}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>Where to stay</p>
              <h3>{h.name}</h3>
              <p className="card__meta" style={{ marginTop: 8 }}>{h.detail}</p>
              <p className="card__meta">{h.distance}</p>
              {h.url && (
                <p className="card__meta" style={{ marginTop: 14 }}>
                  <a href={h.url} target="_blank" rel="noopener noreferrer">Book a room &rarr;</a>
                </p>
              )}
            </article>
          ))}

          {config.travel.shuttle && (
            <article className="card">
              <p className="eyebrow" style={{ marginBottom: 10 }}>Shuttle</p>
              <p className="card__meta" style={{ marginTop: 6 }}>{config.travel.shuttle}</p>
            </article>
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="inner center" style={{ marginBottom: 40 }}>
          <p className="eyebrow">Anything else</p>
          <h2>Questions</h2>
          <hr className="rule" />
        </div>
        <Faq items={config.faq} />
      </section>
    </Layout>
  )
}

function Faq({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="faq">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div className="faq__item" key={item.q}>
            <button
              className="faq__q"
              onClick={() => setOpenIndex(open ? -1 : i)}
              aria-expanded={open}
              aria-controls={`faq-a-${i}`}
            >
              <span>{item.q}</span>
              <span className="faq__sign" aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            <div id={`faq-a-${i}`} hidden={!open}>
              <p className="faq__a">{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
