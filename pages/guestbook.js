import { useRef, useState } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import Layout from '../components/Layout'
import config from '../lib/config'

const fetcher = url => fetch(url).then(r => r.json())

export default function Guestbook() {
  const { data, error, isLoading, mutate } = useSWR('/api/guestbook', fetcher)
  const posts = data?.posts || []

  const [authorName, setAuthorName] = useState('')
  const [message, setMessage] = useState('')
  const [imageData, setImageData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 8 * 1024 * 1024) {
      toast.error('That image is over 8MB. Please pick a smaller one.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => setImageData(reader.result)
    reader.onerror = () => toast.error('Could not read that file.')
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageData(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!authorName.trim() || !message.trim()) {
      toast.error('Please add your name and a message.')
      return
    }

    setSubmitting(true)
    try {
      let imageUrl = null

      if (imageData) {
        const up = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        })
        const upBody = await up.json()
        if (!up.ok) {
          toast.error(upBody.error || 'Image upload failed.')
          return
        }
        imageUrl = upBody.url
      }

      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, message, imageUrl }),
      })
      const body = await res.json()

      if (!res.ok) {
        toast.error(body.error || 'Could not save your message.')
        return
      }

      setMessage('')
      clearImage()
      mutate()
      toast.success('Thank you — your message is up.')
    } catch {
      toast.error('Could not reach the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout title="Guestbook" description={`Leave a message for ${config.coupleNames}.`}>
      <section className="section">
        <div className="inner center" style={{ marginBottom: 44 }}>
          <p className="eyebrow">Say something</p>
          <h2>Guestbook</h2>
          <hr className="rule" />
          <p className="inner--prose" style={{ margin: '0 auto', color: 'var(--ink-soft)' }}>
            Leave us a note, a wish, or an embarrassing photo. We&rsquo;ll read every one.
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="author">Your name</label>
            <input
              id="author"
              type="text"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="message">Your message</label>
            <textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="photo">Add a photo (optional)</label>
            <input id="photo" ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
            {imageData && (
              <div style={{ marginTop: 14 }}>
                <img src={imageData} alt="Preview" style={{ maxHeight: 200, border: '1px solid var(--rule)' }} />
                <button type="button" className="linkbtn" onClick={clearImage} style={{ marginTop: 8 }}>
                  Remove photo
                </button>
              </div>
            )}
          </div>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Posting…' : 'Sign the guestbook'}
          </button>
        </form>
      </section>

      <section className="section section--alt">
        <div className="inner">
          {isLoading && <p className="center" style={{ color: 'var(--ink-faint)' }}>Loading&hellip;</p>}

          {error && <div className="alert alert--error">Couldn&rsquo;t load the guestbook. Please refresh.</div>}

          {!isLoading && !error && posts.length === 0 && (
            <p className="center" style={{ color: 'var(--ink-faint)' }}>
              No messages yet. Be the first.
            </p>
          )}

          {posts.length > 0 && (
            <div className="notes">
              {posts.map(post => (
                <article className="note" key={post.id}>
                  {post.image_url && <img src={post.image_url} alt="" loading="lazy" />}
                  <p className="note__msg">{post.message}</p>
                  <p className="note__author">{post.author_name}</p>
                  <p className="note__date">
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
