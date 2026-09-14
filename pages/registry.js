import Layout from '../components/Layout'
import config from '../lib/config'

export default function Registry() {
  return (
    <Layout title="Registry" description={`Registry for ${config.coupleNames}.`}>
      <section className="section">
        <div className="inner center" style={{ marginBottom: 48 }}>
          <p className="eyebrow">If you&rsquo;d like to</p>
          <h2>Registry</h2>
          <hr className="rule" />
          <p className="inner--prose" style={{ margin: '0 auto', color: 'var(--ink-soft)' }}>
            {config.registry.intro}
          </p>
        </div>

        <div className="inner cards" style={{ maxWidth: 760 }}>
          {config.registry.links.map(item => (
            <article className="card" key={item.name}>
              <h3>{item.name}</h3>
              <p className="card__meta" style={{ marginTop: 8, marginBottom: 18 }}>{item.detail}</p>
              <a className="btn btn--ghost" href={item.url} target="_blank" rel="noopener noreferrer">
                Open {item.name}
              </a>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  )
}
