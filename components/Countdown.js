import { useEffect, useState } from 'react'
import config from '../lib/config'

function remaining(target) {
  const ms = target - Date.now()
  if (ms <= 0) return null
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  }
}

export default function Countdown() {
  // Starts null so the server render and the first client render match —
  // the clock only begins once we're mounted in the browser.
  const [left, setLeft] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (config.dateTbd) return
    const target = new Date(config.weddingDate).getTime()
    setMounted(true)
    setLeft(remaining(target))
    const id = setInterval(() => setLeft(remaining(target)), 1000)
    return () => clearInterval(id)
  }, [])

  // Nothing to count down to yet. Take up no room rather than showing zeros.
  if (config.dateTbd) return <div style={{ height: 24 }} />

  if (!mounted) return <div className="countdown" aria-hidden="true" style={{ minHeight: 86 }} />

  if (!left) {
    return <p className="hero__meta" style={{ margin: '34px 0 40px' }}>Today&rsquo;s the day</p>
  }

  const units = [
    ['days', left.days],
    ['hours', left.hours],
    ['minutes', left.minutes],
    ['seconds', left.seconds],
  ]

  return (
    <div className="countdown">
      {units.map(([label, value]) => (
        <div className="countdown__unit" key={label}>
          <div className="countdown__num">{String(value).padStart(2, '0')}</div>
          <div className="countdown__label">{label}</div>
        </div>
      ))}
    </div>
  )
}
