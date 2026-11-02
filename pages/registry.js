import Layout from '../components/Layout'
import PageHeading from '../components/PageHeading'
import config from '../lib/config'

export default function Registry() {
  return (
    <Layout title="Registry" description={`Registry for ${config.coupleNames}.`}>
      <section className="section registry">
        <PageHeading title="Registry">
          <p>{config.registry.intro}</p>
        </PageHeading>
        <div className="inner center">
          {config.registry.links.map(item => (
            <a className="btn" href={item.url} target="_blank" rel="noopener noreferrer" key={item.url}>
              Visit our {item.name} registry
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </section>
    </Layout>
  )
}
