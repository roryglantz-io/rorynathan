import Layout from '../components/Layout'
import PageHeading from '../components/PageHeading'
import config from '../lib/config'

export default function Details() {
  const venues = config.venues.filter(venue => venue.address)
  const hasTravel = config.travel.airports.length > 0 || config.travel.hotels.length > 0 || config.travel.shuttle

  return (
    <Layout title="Details" description={`Schedule, venue and travel details for ${config.coupleNames}.`}>
      <section className="section">
        <PageHeading title="The celebration" note={config.weddingDateLabel}>
          <p>{config.dateTbd
            ? 'A day with our favorite people. We are working out the details, and we will share them here.'
            : 'The places to be, the plans for the day, and everything you need to join us.'}</p>
        </PageHeading>
        {config.schedule.length > 0 && (
          <div className="schedule">
            <h2 className="schedule__heading">The day ahead</h2>
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
        )}
      </section>

      {(venues.length > 0 || config.dressCode.detail) && (
        <section className="section section--alt">
          <div className="inner section-heading center"><h2>Meet us here</h2></div>
          <div className="venue">
            {venues.map(venue => (
              <div className="venue__block" key={venue.venue + venue.name}>
                <p className="eyebrow">{venue.name}</p>
                <h3>{venue.venue}</h3>
                <p className="venue__note">{venue.address}</p>
                {venue.note && <p className="venue__note">{venue.note}</p>}
                {venue.mapQuery && (
                  <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapQuery)}`} target="_blank" rel="noopener noreferrer">Directions</a>
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

      <section className={hasTravel ? 'section' : 'section section--compact'}>
        <div className="inner inner--prose center section-heading">
          <h2>Make a weekend of it</h2>
          <p className="section-intro">{config.travel.intro}</p>
        </div>
        {hasTravel && (
          <div className="travel">
            {config.travel.airports.length > 0 && (
              <div className="travel__block">
                <h3>Nearest airports</h3>
                {config.travel.airports.map(airport => (
                  <div className="travel-option" key={airport.name}>
                    <div>{airport.name}</div>
                    <p className="venue__note">{airport.detail}</p>
                  </div>
                ))}
              </div>
            )}
            {config.travel.hotels.map(hotel => (
              <div className="travel__block" key={hotel.name}>
                <h3>{hotel.name}</h3>
                <p className="venue__note">{hotel.detail}</p>
                <p className="venue__note">{hotel.distance}</p>
                {hotel.url && <a className="text-link" href={hotel.url} target="_blank" rel="noopener noreferrer">Book a room</a>}
              </div>
            ))}
            {config.travel.shuttle && (
              <div className="travel__block">
                <h3>Shuttle</h3>
                <p className="venue__note">{config.travel.shuttle}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {config.faq.length > 0 && (
        <section className="section section--alt">
          <div className="inner center section-heading"><h2>A few things to know</h2></div>
          <div className="faq">
            {config.faq.map(item => (
              <details className="faq__item" key={item.q}>
                <summary className="faq__q">{item.q}<span className="faq__sign" aria-hidden="true" /></summary>
                <p className="faq__a">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </Layout>
  )
}
