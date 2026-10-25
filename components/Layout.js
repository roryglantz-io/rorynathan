import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import config from '../lib/config'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/details', label: 'Details' },
  { href: '/registry', label: 'Registry' },
  { href: '/rsvp', label: 'RSVP' },
]

export default function Layout({ children, title, description }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const pageTitle = title ? `${title} — ${config.coupleNames}` : `${config.coupleNames} — ${config.weddingDateLabel}`
  const desc = description || (config.dateTbd
    ? `Join ${config.coupleNames} as they plan their wedding. Details and updates to come.`
    : `Celebrate with ${config.coupleNames} on ${config.weddingDateLabel}. ${config.location}.`)

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={desc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content="website" />
      </Head>

      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__brand" onClick={() => setOpen(false)}>
            <span className="sr-only">{config.coupleNames} home</span>
            <span className="brand-mark" aria-hidden="true">
              {config.couple.partnerOne[0]}<span>&amp;</span>{config.couple.partnerTwo[0]}
            </span>
          </Link>

          <button
            className="nav__toggle"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-controls="main-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '✕' : '☰'}
          </button>

          <nav id="main-navigation" className="nav__links" aria-label="Main navigation" data-open={open} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
            {LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="nav__link"
                aria-current={router.pathname === link.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>{children}</main>

      <footer className="footer">
        <div className="footer__names">{config.coupleNames}</div>
        <p>{config.weddingDateLabel}</p>
        {!config.locationTbd && <p>{config.location}</p>}
        {config.couple.hashtag && <p>{config.couple.hashtag}</p>}
        {config.contactEmail && config.contactEmail !== 'hello@example.com' && (
          <p>Questions? <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></p>
        )}
      </footer>
    </>
  )
}
