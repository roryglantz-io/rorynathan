import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import config from '../lib/config'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/details', label: 'Details' },
  { href: '/gallery', label: 'Photos' },
  { href: '/guestbook', label: 'Guestbook' },
  { href: '/registry', label: 'Registry' },
  { href: '/rsvp', label: 'RSVP' },
]

export default function Layout({ children, title, description }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const pageTitle = title ? `${title} — ${config.coupleNames}` : `${config.coupleNames} — ${config.weddingDateLabel}`
  const desc = description || `${config.coupleNames} are getting married on ${config.weddingDateLabel} in ${config.location}.`

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

      <header className="nav">
        <div className="nav__inner">
          <Link href="/" className="nav__brand" onClick={() => setOpen(false)}>
            {config.couple.partnerOne} &amp; {config.couple.partnerTwo}
          </Link>

          <button
            className="nav__toggle"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? '✕' : '☰'}
          </button>

          <nav className="nav__links" data-open={open}>
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

      <main>{children}</main>

      <footer className="footer">
        <p>{config.coupleNames} &middot; {config.weddingDateLabel}</p>
        <p>{config.location}</p>
        {config.couple.hashtag && <p>{config.couple.hashtag}</p>}
        <p>
          Questions? <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
        </p>
      </footer>
    </>
  )
}
