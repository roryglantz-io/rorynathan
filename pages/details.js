import Layout from '../components/Layout'
import PageHeading from '../components/PageHeading'
import config from '../lib/config'

export default function Details() {
  return (
    <Layout title="Details" description={`Wedding details for ${config.coupleNames}, ${config.weddingDateLabel} in ${config.location}.`}>
      <section className="section">
        <PageHeading title="Details" note={`${config.weddingDateLabel} · ${config.location}`}>
          <p>We’re still finalizing the details. We’ll share more here soon.</p>
        </PageHeading>
      </section>
    </Layout>
  )
}
