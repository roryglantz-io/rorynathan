import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { toast, Toaster } from 'sonner'
import Layout from '../components/Layout'

// The token lives in localStorage so the couple can bookmark /admin and stay
// signed in. It is sent as a bearer header on every request.
const TOKEN_KEY = 'wedding_admin_token'

function authFetcher(token) {
  return url =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(async r => {
      const body = await r.json()
      if (!r.ok) throw new Error(body.error || 'Request failed')
      return body
    })
}

export default function Admin() {
  const [token, setToken] = useState('')
  const [input, setInput] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY)
    if (saved) setToken(saved)
    setReady(true)
  }, [])

  function signIn(e) {
    e.preventDefault()
    window.localStorage.setItem(TOKEN_KEY, input.trim())
    setToken(input.trim())
  }

  function signOut() {
    window.localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setInput('')
  }

  if (!ready) return null

  if (!token) {
    return (
      <Layout title="Admin">
        <section className="section">
          <form className="form inner--prose" onSubmit={signIn}>
            <div className="center" style={{ marginBottom: 36 }}>
              <p className="eyebrow">Private</p>
              <h2>Admin</h2>
              <hr className="rule" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="token">Admin token</label>
              <input
                id="token"
                type="password"
                value={input}
                onChange={e => setInput(e.target.value)}
                autoComplete="current-password"
                required
              />
              <p className="field__hint">The ADMIN_TOKEN value from your environment variables.</p>
            </div>
            <button className="btn" type="submit">Sign in</button>
          </form>
        </section>
      </Layout>
    )
  }

  return <Dashboard token={token} onSignOut={signOut} />
}

function Dashboard({ token, onSignOut }) {
  const fetcher = authFetcher(token)
  const rsvps = useSWR('/api/admin/rsvps', fetcher)

  // A bad token surfaces as a failed fetch — say so plainly rather than
  // rendering an empty dashboard that looks like nobody has replied.
  if (rsvps.error) {
    const unauthorized = rsvps.error.message === 'Unauthorized'
    // "relation does not exist" means the tables haven't been created yet —
    // a first deploy, not a real fault.
    const needsSetup = !unauthorized && /does not exist|relation|no database connection/i.test(rsvps.error.message)

    return (
      <Layout title="Admin">
        <Toaster position="bottom-center" />
        <section className="section">
          <div className="inner inner--prose">
            <div className="alert alert--error">
              {unauthorized
                ? 'That admin token was not accepted.'
                : needsSetup
                  ? `The database isn't set up yet. ${rsvps.error.message}`
                  : `Could not load data: ${rsvps.error.message}`}
            </div>

            {needsSetup && <SetupButton token={token} onDone={() => rsvps.mutate()} />}

            <button className="btn btn--ghost" onClick={onSignOut} style={{ marginTop: 14 }}>
              Use a different token
            </button>
          </div>
        </section>
      </Layout>
    )
  }

  const stats = rsvps.data?.stats
  const list = rsvps.data?.rsvps || []
  const awaiting = rsvps.data?.awaiting || []

  return (
    <Layout title="Admin">
      <Toaster position="bottom-center" />
      <section className="section">
        <div className="inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
            <div>
              <p className="eyebrow">Private</p>
              <h2>Dashboard</h2>
            </div>
            <button className="linkbtn" onClick={onSignOut}>Sign out</button>
          </div>

          {!stats && <p style={{ color: 'var(--ink-faint)' }}>Loading&hellip;</p>}

          {stats && (
            <>
              <div className="stats">
                <Stat num={stats.attendingHeads} label="Guests attending" />
                <Stat num={stats.partiesAttending} label="Parties accepted" />
                <Stat num={stats.partiesDeclined} label="Parties declined" />
                <Stat num={stats.awaitingCount} label="Yet to reply" />
              </div>

              <div className="cards" style={{ marginBottom: 40 }}>
                <div className="card">
                  <p className="eyebrow" style={{ marginBottom: 12 }}>Meal counts</p>
                  {Object.keys(stats.meals).length === 0 ? (
                    <p className="card__meta">No meals selected yet.</p>
                  ) : (
                    Object.entries(stats.meals).map(([meal, count]) => (
                      <div key={meal} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                        <span style={{ textTransform: 'capitalize' }}>{meal}</span>
                        <strong>{count}</strong>
                      </div>
                    ))
                  )}
                </div>

                <div className="card">
                  <p className="eyebrow" style={{ marginBottom: 12 }}>Dietary notes</p>
                  {stats.dietary.length === 0 ? (
                    <p className="card__meta">None so far.</p>
                  ) : (
                    stats.dietary.map((d, i) => (
                      <p className="card__meta" key={i} style={{ marginBottom: 8 }}>
                        <strong>{d.name}:</strong> {d.dietary}
                      </p>
                    ))
                  )}
                </div>

                <div className="card">
                  <p className="eyebrow" style={{ marginBottom: 12 }}>Export</p>
                  <p className="card__meta" style={{ marginBottom: 16 }}>
                    One row per guest, ready for the caterer.
                  </p>
                  <a
                    className="btn btn--ghost"
                    href={`/api/admin/rsvps?format=csv&admin=${encodeURIComponent(token)}`}
                  >
                    Download CSV
                  </a>
                </div>

                <SaveTheDateCard token={token} />

                <div className="card">
                  <p className="eyebrow" style={{ marginBottom: 12 }}>Database</p>
                  <p className="card__meta" style={{ marginBottom: 16 }}>
                    Creates any missing tables. Safe to run again at any time.
                  </p>
                  <SetupButton token={token} onDone={() => rsvps.mutate()} />
                </div>
              </div>

              <h3 style={{ marginBottom: 16 }}>Replies</h3>
              {list.length === 0 ? (
                <p style={{ color: 'var(--ink-faint)' }}>No replies yet.</p>
              ) : (
                <div className="table-wrap" style={{ marginBottom: 40 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Party</th><th>Email</th><th>Reply</th><th>Guests</th><th>Song</th><th>Note</th><th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map(r => (
                        <tr key={r.id}>
                          <td>{r.party_name}</td>
                          <td>{r.email}</td>
                          <td>{r.attending ? 'Attending' : 'Declined'}</td>
                          <td>
                            {(Array.isArray(r.attendees) ? r.attendees : []).map((a, i) => (
                              <div key={i}>
                                {a.name} <span style={{ color: 'var(--ink-faint)' }}>({a.meal})</span>
                                {a.dietary && <div style={{ color: 'var(--ink-faint)', fontSize: 13 }}>{a.dietary}</div>}
                              </div>
                            ))}
                          </td>
                          <td>{r.song_request || ''}</td>
                          <td style={{ maxWidth: 260 }}>{r.note || ''}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {awaiting.length > 0 && (
                <>
                  <h3 style={{ marginBottom: 16 }}>Still to hear from ({awaiting.length})</h3>
                  <div className="table-wrap" style={{ marginBottom: 40 }}>
                    <table>
                      <thead>
                        <tr><th>Party</th><th>Email</th><th>Seats held</th></tr>
                      </thead>
                      <tbody>
                        {awaiting.map((g, i) => (
                          <tr key={i}>
                            <td>{g.party_name}</td>
                            <td>{g.email || <span style={{ color: 'var(--ink-faint)' }}>no email</span>}</td>
                            <td>{g.max_guests}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </section>
    </Layout>
  )
}

function Stat({ num, label }) {
  return (
    <div className="stat">
      <div className="stat__num">{num}</div>
      <div className="stat__label">{label}</div>
    </div>
  )
}

function SaveTheDateCard({ token }) {
  const [busy, setBusy] = useState(false)

  async function send(testEmail) {
    if (!testEmail && !window.confirm('Send the save-the-date to everyone on the guest list who has not already received one. Continue?')) {
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/send-save-the-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(testEmail ? { test: testEmail } : {}),
      })
      const body = await res.json()
      if (!res.ok) { toast.error(body.error || 'Send failed.'); return }
      toast.success(testEmail ? `Preview sent to ${testEmail}` : `Sent ${body.sent}, failed ${body.failed}`)
    } catch {
      toast.error('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <p className="eyebrow" style={{ marginBottom: 12 }}>Save the dates</p>
      <p className="card__meta" style={{ marginBottom: 16 }}>
        Goes to everyone on the guest list with an email who hasn&rsquo;t had one. Safe to re-run.
      </p>
      <button
        className="linkbtn"
        disabled={busy}
        onClick={() => {
          const email = window.prompt('Send a preview to which address?')
          if (email) send(email)
        }}
        style={{ display: 'block', marginBottom: 12 }}
      >
        Send myself a preview
      </button>
      <button className="btn btn--ghost" disabled={busy} onClick={() => send(null)}>
        {busy ? 'Sending…' : 'Send to everyone'}
      </button>
    </div>
  )
}

function SetupButton({ token, onDone }) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)

  async function run() {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()
      if (!res.ok) {
        toast.error(body.error || 'Setup failed.')
        return
      }
      setDone(body.created)
      toast.success('Database ready.')
      onDone?.()
    } catch {
      toast.error('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button className="btn" onClick={run} disabled={busy}>
        {busy ? 'Setting up\u2026' : 'Set up database'}
      </button>
      {done && (
        <ul style={{ color: 'var(--ink-faint)', fontSize: 15, marginTop: 14, paddingLeft: 18 }}>
          {done.map(d => <li key={d}>{d}</li>)}
        </ul>
      )}
    </div>
  )
}
