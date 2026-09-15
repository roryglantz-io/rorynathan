import { useCallback, useEffect, useRef, useState } from 'react'
import config from '../lib/config'

export default function PhotoStrip() {
  const trackRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const photos = config.photos || []

  // Disable an arrow once you've run out of strip in that direction, rather
  // than leaving a button that looks live and does nothing.
  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows, photos.length])

  function scrollBy(direction) {
    const el = trackRef.current
    if (!el) return
    // Leave a sliver of the previous photo visible so it reads as one
    // continuous strip rather than discrete pages.
    const step = el.clientWidth * 0.8
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * step, behavior: reduced ? 'auto' : 'smooth' })
  }

  // Nothing to show until photos are added, and an empty strip is worse than
  // no strip.
  if (photos.length === 0) return null

  return (
    <section className="strip">
      <div className="strip__head inner">
        <p className="eyebrow" style={{ margin: 0 }}>A few of us</p>
        <div className="strip__arrows">
          <button type="button" onClick={() => scrollBy(-1)} disabled={atStart} aria-label="Previous photos">&larr;</button>
          <button type="button" onClick={() => scrollBy(1)} disabled={atEnd} aria-label="Next photos">&rarr;</button>
        </div>
      </div>

      {/* tabIndex makes the strip focusable so it can be scrolled with the
          arrow keys, which is how keyboard users reach the later photos. */}
      <div
        className="strip__track"
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label="Photographs of Rory and Nathan"
      >
        {photos.map((photo, i) => (
          <figure className="strip__item" key={photo.src || i}>
            <img src={photo.src} alt={photo.alt || ''} loading={i < 2 ? 'eager' : 'lazy'} />
          </figure>
        ))}
      </div>
    </section>
  )
}
