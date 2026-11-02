import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { toast, Toaster } from 'sonner'
import Layout from '../components/Layout'
import PageHeading from '../components/PageHeading'
import config from '../lib/config'

const MEALS = [
  { value: 'chicken', label: 'Chicken' },
  { value: 'fish', label: 'Fish' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
]

const emptyAttendee = () => ({ name: '', meal: 'chicken', dietary: '' })

export default function Rsvp() {
  const router = useRouter()

  const [partyName, setPartyName] = useState('')
  const [email, setEmail] = useState('')
  const [attending, setAttending] = useState(null)
  const [attendees, setAttendees] = useState([emptyAttendee()])
  const [songRequest, setSongRequest] = useState('')
  const [note, setNote] = useState('')

  const [inviteCode, setInviteCode] = useState('')
  const [maxGuests, setMaxGuests] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)
  const [error, setError] = useState('')

  // Deadline check runs on the client so a statically served page can't cache
  // a stale "still open" state. The API enforces it again on submit.
  const [closed, setClosed] = useState(false)
  useEffect(() => {
    if (!config.rsvpDeadline) return
    setClosed(Date.now() > new Date(config.rsvpDeadline).getTime())
  }, [])

  // A code in the URL (from the save-the-date email) pre-fills the party.
  useEffect(() => {
    if (!router.isReady) return
    const code = router.query.code
    if (!code) return

    setInviteCode(String(code))
    fetch(`/api/rsvp?code=${encodeURIComponent(String(code))}`)
      .then(r => r.json().then(body => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) return
        setPartyName(body.partyName || '')
        if (body.email) setEmail(body.email)
        setMaxGuests(body.maxGuests)
      })
      .catch(() => {})
  }, [router.isReady, router.query.code])

  function updateAttendee(index, patch) {
    setAttendees(list => list.map((a, i) => (i === index ? { ...a, ...patch } : a)))
  }

  function addAttendee() {
    if (maxGuests !== null && attendees.length >= maxGuests) {
      toast.error(`Your invitation has ${maxGuests} seat${maxGuests === 1 ? '' : 's'}.`)
      return
    }
    setAttendees(list => [...list, emptyAttendee()])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (attending === null) {
      setError('Please let us know whether you can make it.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyName,
          email,
          attending,
          attendees: attending ? attendees : [],
          songRequest,
          note,
          inviteCode: inviteCode || undefined,
        }),
      })
      const body = await res.json()

      if (!res.ok) {
        setError(body.error || 'Something went wrong. Please try again.')
        return
      }

      setDone({ attending, updated: body.updated })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Could not reach the server. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <Layout title="Thank you">
        <Toaster position="bottom-center" />
        <section className="section">
          <div className="inner inner--prose center">
            <p className="eyebrow">{done.updated ? 'Reply updated' : 'Reply received'}</p>
            <h2>{done.attending ? 'Wonderful.' : 'Thank you for letting us know.'}</h2>
            <hr className="rule" />
            <p style={{ color: 'var(--ink-soft)' }}>
              {done.attending
                ? config.dateTbd
                  ? `Thank you — we have your details. We'll be in touch as soon as we've settled on a date.`
                  : `We can't wait to see you on ${config.weddingDateLabel}. We'll be in touch closer to the day with anything else you need.`
                : `We'll miss you, and we completely understand. Thank you for taking a moment to reply.`}
            </p>
            <p style={{ color: 'var(--ink-soft)' }}>
              Changed your mind, or made a mistake? Submit the form again with the same email
              address{config.rsvpDeadlineLabel ? ` before ${config.rsvpDeadlineLabel}` : ''} and it will replace this reply.
            </p>
            <button className="btn btn--ghost" onClick={() => setDone(null)} style={{ marginTop: 10 }}>
              Edit my reply
            </button>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout title="RSVP" description={`RSVP for ${config.coupleNames}, ${config.weddingDateLabel}.`}>
      <Toaster position="bottom-center" />
      <section className="section">
        <PageHeading
          title={config.dateTbd ? 'Stay in the loop.' : 'Celebrate with us.'}
          note={config.rsvpDeadlineLabel ? `Kindly reply by ${config.rsvpDeadlineLabel}` : 'We\u2019d love to hear from you'}
        >
          <p>{config.dateTbd
            ? 'We haven\u2019t set a date yet. Leave your details and a tentative reply. We\u2019ll share our plans as they come together.'
            : 'Let us know who\u2019s joining us. We can\u2019t wait to see you.'}</p>
        </PageHeading>

        {closed ? (
          <div className="inner inner--prose center">
            <div className="alert alert--info">
              RSVPs closed on {config.rsvpDeadlineLabel}. If you still need to reach us, please
              email <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a> — we&rsquo;ll do our best.
            </div>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            {error && <div className="alert alert--error">{error}</div>}

            <div className="field">
              <label className="field__label" htmlFor="partyName">Your name</label>
              <input
                id="partyName"
                type="text"
                value={partyName}
                onChange={e => setPartyName(e.target.value)}
                placeholder="As it appears on your invitation"
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <p className="field__hint">
                We&rsquo;ll only use this for wedding updates — and it&rsquo;s how you edit this reply later.
              </p>
            </div>

            <div className="field">
              <span className="field__label">
                {config.dateTbd ? 'Do you think you can make it?' : 'Will you be joining us?'}
              </span>
              <div className="choice">
                <button
                  type="button"
                  className="choice__btn"
                  aria-pressed={attending === true}
                  onClick={() => setAttending(true)}
                >
                  Joyfully accepts
                </button>
                <button
                  type="button"
                  className="choice__btn"
                  aria-pressed={attending === false}
                  onClick={() => setAttending(false)}
                >
                  Regretfully declines
                </button>
              </div>
            </div>

            {attending === true && (
              <div className="field">
                <span className="field__label">
                  Who&rsquo;s coming
                  {maxGuests !== null && ` (${maxGuests} seat${maxGuests === 1 ? '' : 's'} reserved)`}
                </span>

                {attendees.map((a, i) => (
                  <div className="attendee" key={i}>
                    <div className="attendee__head">
                      <span className="attendee__num">Guest {i + 1}</span>
                      {attendees.length > 1 && (
                        <button
                          type="button"
                          className="linkbtn"
                          onClick={() => setAttendees(list => list.filter((_, j) => j !== i))}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="field">
                      <label className="field__label" htmlFor={`name-${i}`}>Full name</label>
                      <input
                        id={`name-${i}`}
                        type="text"
                        value={a.name}
                        onChange={e => updateAttendee(i, { name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field">
                      <label className="field__label" htmlFor={`meal-${i}`}>Meal choice</label>
                      <select
                        id={`meal-${i}`}
                        value={a.meal}
                        onChange={e => updateAttendee(i, { meal: e.target.value })}
                      >
                        {MEALS.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field" style={{ marginBottom: 0 }}>
                      <label className="field__label" htmlFor={`diet-${i}`}>Allergies or dietary needs</label>
                      <input
                        id={`diet-${i}`}
                        type="text"
                        value={a.dietary}
                        onChange={e => updateAttendee(i, { dietary: e.target.value })}
                        placeholder="Optional — the kitchen is happy to accommodate"
                      />
                    </div>
                  </div>
                ))}

                {(maxGuests === null || attendees.length < maxGuests) && (
                  <button type="button" className="btn btn--ghost" onClick={addAttendee}>
                    Add another guest
                  </button>
                )}
              </div>
            )}

            {attending !== null && (
              <>
                {attending && (
                  <div className="field">
                    <label className="field__label" htmlFor="song">A song that will get you dancing</label>
                    <input
                      id="song"
                      type="text"
                      value={songRequest}
                      onChange={e => setSongRequest(e.target.value)}
                      placeholder="Optional — we're building the playlist"
                    />
                  </div>
                )}

                <div className="field">
                  <label className="field__label" htmlFor="note">A note for us</label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <button className="btn" type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send our reply'}
                </button>
              </>
            )}
          </form>
        )}
      </section>
    </Layout>
  )
}
