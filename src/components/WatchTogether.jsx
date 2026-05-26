import { useState, useEffect } from 'react'
import { FiTrash2, FiCheck } from 'react-icons/fi'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import LoadingSpinner from './LoadingSpinner'

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Format a watch date in a given timezone, returning a short string. */
function formatInZone(isoString, timeZone) {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  }).format(date)
}

/** Get local date string "YYYY-MM-DD" for a date in a given timezone. */
function getLocalDateStr(isoString, timeZone) {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date)
}

/**
 * Show dual timezone for the watch date.
 * Returns { ny, qa, nextDay } where nextDay is true if Qatar date is different.
 */
function getDualTime(isoString) {
  const ny = formatInZone(isoString, 'America/New_York')
  const qa = formatInZone(isoString, 'Asia/Qatar')
  const nyDay = getLocalDateStr(isoString, 'America/New_York')
  const qaDay = getLocalDateStr(isoString, 'Asia/Qatar')
  const nextDay = qaDay !== nyDay
  return { ny, qa, nextDay }
}

/** Format the nice card date label. */
function niceDate(isoString) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  }).format(new Date(isoString))
}

// ── Default form state ───────────────────────────────────────────────────────

const DEFAULT_FORM = {
  title:     '',
  type:      'Movie',
  watchDate: '',
  addedBy:   'Hein',
}

// ── Main component ──────────────────────────────────────────────────────────

export default function WatchTogether({ showToast }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [saving,  setSaving]  = useState(false)

  // ── Real-time Firestore listener ─────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'watchlist'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Watchlist error:', err)
        showToast('Could not load watchlist — check Firebase config', 'error')
        setLoading(false)
      }
    )
    return () => unsub()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sort: unwatched first, then watched ──────────────────
  const sorted = [
    ...items.filter(i => !i.watched),
    ...items.filter(i =>  i.watched),
  ]

  // ── Form handlers ────────────────────────────────────────
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'watchlist'), {
        title:     form.title.trim(),
        type:      form.type,
        watchDate: form.watchDate,
        addedBy:   form.addedBy,
        watched:   false,
        createdAt: serverTimestamp(),
      })
      setForm(DEFAULT_FORM)
      showToast(`"${form.title.trim()}" added to the watchlist! 🎬`)
    } catch (err) {
      console.error(err)
      showToast('Failed to add item — check Firebase config', 'error')
    } finally {
      setSaving(false)
    }
  }

  const markWatched = async (id) => {
    try {
      await updateDoc(doc(db, 'watchlist', id), { watched: true })
      showToast('Marked as watched ✓ Great pick!')
    } catch (err) {
      showToast('Could not update — try again', 'error')
    }
  }

  const deleteItem = async (id, title) => {
    try {
      await deleteDoc(doc(db, 'watchlist', id))
      showToast(`"${title}" removed from the list`)
    } catch (err) {
      showToast('Could not delete — try again', 'error')
    }
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div>

      {/* ── Add form ──────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="bg-cream-dark rounded-2xl p-6 mb-8 shadow-warm border border-cream-darker"
      >
        <h3 className="font-serif text-xl text-brown-dark mb-5">Add something to watch</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Interstellar, Severance..."
              required
              className="
                w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker
                text-brown-dark text-sm font-sans
                focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                placeholder:text-brown-light/50
                transition
              "
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="
                w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker
                text-brown-dark text-sm font-sans
                focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                transition
              "
            >
              <option>Movie</option>
              <option>TV Show</option>
            </select>
          </div>

          {/* Added by */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Added by
            </label>
            <select
              name="addedBy"
              value={form.addedBy}
              onChange={handleChange}
              className="
                w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker
                text-brown-dark text-sm font-sans
                focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                transition
              "
            >
              <option>Hein</option>
              <option>Maine</option>
            </select>
          </div>

          {/* Watch date */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Watch date &amp; time <span className="normal-case">(optional)</span>
            </label>
            <input
              type="datetime-local"
              name="watchDate"
              value={form.watchDate}
              onChange={handleChange}
              className="
                w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker
                text-brown-dark text-sm font-sans
                focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                transition
              "
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="
            mt-5 px-6 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white
            rounded-full text-sm font-sans font-medium
            transition-colors duration-200 shadow-warm
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving ? 'Adding...' : 'Add to list 🎬'}
        </button>
      </form>

      {/* ── List ──────────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Loading your watchlist..." />
      ) : sorted.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sorted.map(item => (
            <WatchCard
              key={item.id}
              item={item}
              onMarkWatched={() => markWatched(item.id)}
              onDelete={() => deleteItem(item.id, item.title)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Watch card ──────────────────────────────────────────────────────────────

function WatchCard({ item, onMarkWatched, onDelete }) {
  const dual = item.watchDate ? getDualTime(item.watchDate) : null

  return (
    <div
      className={`
        bg-cream-dark rounded-2xl p-5 border border-cream-darker shadow-warm
        transition-all duration-200 hover:shadow-warm-lg
        ${item.watched ? 'opacity-60' : ''}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <span className={`
            inline-block text-xs font-sans px-2.5 py-0.5 rounded-full mb-2 font-medium
            ${item.type === 'Movie'
              ? 'bg-terracotta/15 text-terracotta-dark'
              : 'bg-green-light text-brown-dark'
            }
          `}>
            {item.type === 'Movie' ? '🎬 Movie' : '📺 TV Show'}
          </span>

          {/* Title */}
          <h4 className={`
            font-serif text-xl text-brown-dark leading-snug
            ${item.watched ? 'line-through decoration-brown-light/50' : ''}
          `}>
            {item.title}
          </h4>

          <p className="text-xs text-brown-light mt-1 font-sans">
            Added by <span className="font-medium text-brown">{item.addedBy}</span>
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          title="Remove"
          className="
            p-1.5 rounded-full text-brown-light hover:text-terracotta hover:bg-rose-light
            transition-colors duration-150 flex-shrink-0
          "
        >
          <FiTrash2 size={15} />
        </button>
      </div>

      {/* Watch date */}
      {item.watchDate && dual && (
        <div className="mt-4 bg-cream rounded-xl px-4 py-3 border border-cream-darker">
          <p className="text-xs text-brown-light uppercase tracking-wider font-sans mb-1">
            Watch date
          </p>
          <p className="text-sm font-sans text-brown-dark font-medium">
            {niceDate(item.watchDate)}
          </p>
          <div className="mt-2 flex flex-col gap-0.5">
            <p className="text-xs text-brown-light font-sans">
              🇺🇸 <span className="font-medium">{dual.ny}</span>{' '}
              <span className="text-brown-light/60">(Hein's time)</span>
            </p>
            <p className="text-xs text-brown-light font-sans">
              🇶🇦 <span className="font-medium">{dual.qa}</span>
              {dual.nextDay && (
                <span className="ml-1 text-terracotta">(next day)</span>
              )}{' '}
              <span className="text-brown-light/60">(Maine's time)</span>
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {!item.watched && (
        <button
          onClick={onMarkWatched}
          className="
            mt-4 flex items-center gap-2 px-4 py-2 rounded-full
            bg-green/20 text-brown-dark hover:bg-green/40
            text-xs font-sans font-medium transition-colors duration-150
          "
        >
          <FiCheck size={13} />
          Mark as Watched ✓
        </button>
      )}

      {item.watched && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-sans text-green font-medium">
          <FiCheck size={12} /> Watched together ✓
        </span>
      )}
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🍿</div>
      <p className="font-serif italic text-brown-light text-lg">
        No movies or shows yet!
      </p>
      <p className="font-sans text-sm text-brown-light/70 mt-2">
        Add something for date night 💛
      </p>
    </div>
  )
}
