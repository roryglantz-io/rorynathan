import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import config from '../lib/config'

export default function Unlock() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Something went wrong. Please try again.')
        return
      }
      // Full navigation rather than a client-side push, so the middleware
      // re-runs and sees the cookie we just set.
      const next = typeof router.query.next === 'string' ? router.query.next : '/'
      window.location.href = next.startsWith('/') ? next : '/'
    } catch {
      setError('Could not reach the server. Please check your connection.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Head>
        <title>{config.coupleNames}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" rel="stylesheet" />
      </Head>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '48px 24px',
        }}
      >
        <p className="eyebrow">You&rsquo;re invited</p>
        <h1 style={{ fontSize: 'clamp(2.8rem, 9vw, 4.6rem)' }}>
          {config.couple.partnerOne}
          <span className="hero__amp">and</span>
          {config.couple.partnerTwo}
        </h1>
        <hr className="rule" />

        <form onSubmit={submit} style={{ width: '100%', maxWidth: 340, marginTop: 8 }}>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 26 }}>
            Please enter the password from your invitation.
          </p>

          {error && <div className="alert alert--error" style={{ textAlign: 'left' }}>{error}</div>}

          <div className="field">
            <label className="field__label sr-only" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
              style={{ textAlign: 'center' }}
            />
          </div>

          <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Checking…' : 'Enter'}
          </button>
        </form>

        <p className="card__meta" style={{ marginTop: 32 }}>
          Lost it? Email <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>
        </p>
      </main>
    </>
  )
}
