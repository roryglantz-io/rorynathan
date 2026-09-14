import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
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
  const guestbook = useSWR('/api/admin/guestbook', fetcher)

  // A bad token surfaces as a failed fetch — say so plainly rather than
  // rendering an empty dashboard that looks like nobody has replied.
  if (rsvps.error) {
    return (
      <Layout title="Admin">
        <section className="section">
          <div className="inner inner--prose">
            <div className="alert alert--error">
              {rsvps.error.message === 'Unauthorized'
                ? 'That admin token was not accepted.'
                : `Could not load data: ${rsvps.error.message}`}
            </div>
            <button className="btn btn--ghost" onClick={onSignOut}>Use a different token</button>
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

          <GalleryManager token={token} />

          <h3 style={{ margin: '40px 0 16px' }}>Guestbook moderation</h3>
          {guestbook.error && <div className="alert alert--error">{guestbook.error.message}</div>}
          {guestbook.data?.posts?.length === 0 && (
            <p style={{ color: 'var(--ink-faint)' }}>No guestbook messages yet.</p>
          )}
          {guestbook.data?.posts?.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>From</th><th>Message</th><th>Visible</th><th></th></tr>
                </thead>
                <tbody>
                  {guestbook.data.posts.map(p => (
                    <tr key={p.id}>
                      <td>{p.author_name}</td>
                      <td style={{ maxWidth: 380 }}>
                        {p.message}
                        {p.image_url && (
                          <div><a href={p.image_url} target="_blank" rel="noopener noreferrer">view photo</a></div>
                        )}
                      </td>
                      <td>{p.approved ? 'Yes' : 'Hidden'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className="linkbtn"
                          onClick={async () => {
                            await fetch('/api/admin/guestbook', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ id: p.id, approved: !p.approved }),
                            })
                            guestbook.mutate()
                          }}
                        >
                          {p.approved ? 'Hide' : 'Show'}
                        </button>
                        <button
                          className="linkbtn"
                          onClick={async () => {
                            if (!window.confirm(`Permanently delete the message from ${p.author_name}?`)) return
                            await fetch('/api/admin/guestbook', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ id: p.id }),
                            })
                            guestbook.mutate()
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

function GalleryManager({ token }) {
  const fetcher = url => fetch(url).then(r => r.json())
  const { data, mutate } = useSWR('/api/gallery', fetcher)
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  async function upload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setBusy(true)
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const up = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      })
      const upBody = await up.json()
      if (!up.ok) { toast.error(upBody.error || 'Upload failed.'); return }

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrl: upBody.url, caption }),
      })
      if (!res.ok) { toast.error('Could not add the photo.'); return }

      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
      mutate()
      toast.success('Photo added.')
    } catch {
      toast.error('Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h3 style={{ margin: '40px 0 16px' }}>Gallery</h3>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field">
          <label className="field__label" htmlFor="cap">Caption (optional)</label>
          <input id="cap" type="text" value={caption} onChange={e => setCaption(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field__label" htmlFor="galfile">Choose a photo to add</label>
          <input id="galfile" ref={fileRef} type="file" accept="image/*" onChange={upload} disabled={busy} />
        </div>
      </div>

      <div className="gallery">
        {(data?.photos || []).map(p => (
          <figure className="gallery__item" key={p.id}>
            <img src={p.image_url} alt={p.caption || ''} loading="lazy" />
            <figcaption className="gallery__caption">
              {p.caption}
              <button
                className="linkbtn"
                onClick={async () => {
                  if (!window.confirm('Remove this photo from the gallery?')) return
                  await fetch('/api/admin/gallery', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ id: p.id }),
                  })
                  mutate()
                }}
              >
                Remove
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  )
}
