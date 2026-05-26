import { useState, useEffect } from 'react'

// ── Timezone helpers ────────────────────────────────────────────────────────

/**
 * Get UTC offset in minutes for a given timezone at a given moment.
 * Uses the "epoch trick": format the UTC instant as local zone time,
 * re-parse as UTC, then diff. Correctly handles DST transitions.
 */
function getUTCOffsetMinutes(date, timeZone) {
  // en-CA gives "YYYY-MM-DD, HH:mm:ss" — easy to parse as ISO
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year:   'numeric',
    month:  '2-digit',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

  // Treat the local-zone time as if it were UTC to compute offset
  const asUTC = new Date(formatted.replace(', ', 'T') + 'Z')
  return Math.round((asUTC.getTime() - date.getTime()) / 60000)
}

/**
 * Format a Date in a specific timezone.
 * Returns { time, date, period } strings for display.
 */
function formatInZone(date, timeZone) {
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour:   'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date)

  const dateStr = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  }).format(date)

  return { time, dateStr }
}

/**
 * Build a human-readable time-difference string.
 * e.g. "Maine is 7 hours ahead of Hein"
 */
function getTimeDifferenceText(date) {
  const nyOffset  = getUTCOffsetMinutes(date, 'America/New_York')
  const qatOffset = getUTCOffsetMinutes(date, 'Asia/Qatar')
  const diffMins  = qatOffset - nyOffset

  const totalHours = Math.floor(Math.abs(diffMins) / 60)
  const mins        = Math.abs(diffMins) % 60
  const ahead       = diffMins >= 0

  const timeStr = mins > 0
    ? `${totalHours} hr ${mins} min`
    : `${totalHours} hour${totalHours !== 1 ? 's' : ''}`

  return ahead
    ? `Maine is ${timeStr} ahead of Hein ☀️`
    : `Hein is ${timeStr} ahead of Maine ☀️`
}

// ── Clock Card component ────────────────────────────────────────────────────

function ClockCard({ name, flag, city, country, timeZone, now }) {
  const { time, dateStr } = formatInZone(now, timeZone)

  // Split time into clock part + AM/PM
  const [clockPart, period] = time.split(' ')

  return (
    <div
      className="
        flex-1 bg-cream-dark rounded-2xl p-8
        border-t-4 border-terracotta
        shadow-warm
        animate-pulse-soft
        flex flex-col items-center text-center gap-2
        transition-shadow duration-300 hover:shadow-warm-lg
      "
    >
      {/* Person + flag */}
      <div className="text-4xl mb-1">{flag}</div>
      <h3 className="font-serif text-2xl text-brown-dark font-semibold">
        {name}
      </h3>
      <p className="font-sans text-xs text-brown-light uppercase tracking-widest">
        {city} · {country}
      </p>

      {/* Time display */}
      <div className="mt-4 mb-2">
        <span className="font-serif text-5xl md:text-6xl text-brown-dark font-medium tabular-nums leading-none">
          {clockPart}
        </span>
        <span className="font-sans text-xl text-terracotta font-medium ml-2 align-middle">
          {period}
        </span>
      </div>

      {/* Date */}
      <p className="font-sans text-sm text-brown-light mt-1">
        {dateStr}
      </p>

      {/* Timezone badge */}
      <span className="mt-3 inline-block px-3 py-1 rounded-full bg-cream text-xs text-brown-light font-sans border border-cream-darker">
        {timeZone}
      </span>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function OurClocks() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const diffText = getTimeDifferenceText(now)

  return (
    <div>
      {/* Clock cards */}
      <div className="flex flex-col md:flex-row gap-6">
        <ClockCard
          name="Hein"
          flag="🇺🇸"
          city="Rockville"
          country="Maryland, USA"
          timeZone="America/New_York"
          now={now}
        />
        <ClockCard
          name="Maine"
          flag="🇶🇦"
          city="Doha"
          country="Qatar"
          timeZone="Asia/Qatar"
          now={now}
        />
      </div>

      {/* Time difference status line */}
      <div className="mt-6 text-center">
        <p className="inline-block font-sans text-sm text-brown-light bg-cream-dark px-5 py-2 rounded-full border border-cream-darker">
          {diffText}
        </p>
      </div>

      {/* Sweet message */}
      <p className="mt-4 text-center font-serif italic text-brown-light/70 text-sm">
        no matter the distance, you're always on my mind 🌙
      </p>
    </div>
  )
}
