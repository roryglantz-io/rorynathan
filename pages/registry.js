import Link from 'next/link'
import Layout from '../components/Layout'
import PageHeading from '../components/PageHeading'
import config from '../lib/config'

export default function Registry() {
  return (
    <Layout title="Registry" description={`Registry for ${config.coupleNames}.`}>
      <section className="section registry">
        <PageHeading title="Your presence is the gift." note="Our registry">
          <p>{config.registry.intro}</p>
        </PageHeading>
        {config.registry.links.length > 0 ? (
          <div className="inner registry__links">
            {config.registry.links.map(item => (
              <div className="venue__block" key={item.name}>
                <h3>{item.name}</h3>
                <p className="venue__note">{item.detail}</p>
                <a className="text-link" href={item.url} target="_blank" rel="noopener noreferrer">Open {item.name}</a>
              </div>
            ))}
          </div>
        ) : (
          <div className="registry__note inner inner--prose center">
            <span className="registry__ornament" aria-hidden="true">—</span>
            <p className="registry__empty">For now, just bring yourself.</p>
            <Link href="/details" className="text-link">Back to the celebration</Link>
          </div>
        )}
      </section>
    </Layout>
  )
}
