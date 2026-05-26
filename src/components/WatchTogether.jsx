import { useState, useEffect } from 'react'
import { FiTrash2, FiCheck } from 'react-icons/fi'
import { supabase } from '../supabase'
import LoadingSpinner from './LoadingSpinner'

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function getLocalDateStr(isoString, timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(isoString))
}

function getDualTime(isoString) {
  const ny    = formatInZone(isoString, 'America/New_York')
  const qa    = formatInZone(isoString, 'Asia/Qatar')
  const nyDay = getLocalDateStr(isoString, 'America/New_York')
  const qaDay = getLocalDateStr(isoString, 'Asia/Qatar')
  return { ny, qa, nextDay: qaDay !== nyDay }
}

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

function formatTimestamp(ts) {
  if (!ts) return ''
  return new Intl.DateTimeFormat('en-US', {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
  }).format(new Date(ts))
}

// ── Default form ─────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  title:      '',
  type:       'Movie',
  watch_date: '',
  added_by:   'Hein',
}

// ── Main component ──────────────────────────────────────────────────────────

export default function WatchTogether({ showToast }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [saving,  setSaving]  = useState(false)

  // ── Fetch data ───────────────────────────────────────────
  async function fetchItems() {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      showToast('Could not load watchlist — check Supabase config', 'error')
    } else {
      setItems(data)
    }
    setLoading(false)
  }

  // ── Real-time subscription ───────────────────────────────
  useEffect(() => {
    fetchItems()

    const channel = supabase
      .channel('watchlist-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'watchlist' }, fetchItems)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sort: unwatched first ────────────────────────────────
  const sorted = [
    ...items.filter(i => !i.watched),
    ...items.filter(i =>  i.watched),
  ]

  // ── Form handlers ────────────────────────────────────────
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)

    const { error } = await supabase.from('watchlist').insert({
      title:      form.title.trim(),
      type:       form.type,
      watch_date: form.watch_date || null,
      added_by:   form.added_by,
      watched:    false,
    })

    if (error) {
      console.error(error)
      showToast('Failed to add — check Supabase config', 'error')
    } else {
      setForm(DEFAULT_FORM)
      showToast(`"${form.title.trim()}" added to the watchlist! 🎬`)
    }
    setSaving(false)
  }

  const markWatched = async (id) => {
    const { error } = await supabase
      .from('watchlist')
      .update({ watched: true })
      .eq('id', id)

    if (error) showToast('Could not update — try again', 'error')
    else showToast('Marked as watched ✓ Great pick!')
  }

  const deleteItem = async (id, title) => {
    const { error } = await supabase.from('watchlist').delete().eq('id', id)
    if (error) showToast('Could not delete — try again', 'error')
    else showToast(`"${title}" removed from the list`)
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
          <div className="sm:col-span-2">
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Interstellar, Severance..."
              required
              className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta placeholder:text-brown-light/50 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
            >
              <option>Movie</option>
              <option>TV Show</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">Added by</label>
            <select
              name="added_by"
              value={form.added_by}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
            >
              <option>Hein</option>
              <option>Maine</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Watch date &amp; time <span className="normal-case">(optional)</span>
            </label>
            <input
              type="datetime-local"
              name="watch_date"
              value={form.watch_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 px-6 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white rounded-full text-sm font-sans font-medium transition-colors duration-200 shadow-warm disabled:opacity-50 disabled:cursor-not-allowed"
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
  const dual = item.watch_date ? getDualTime(item.watch_date) : null

  return (
    <div className={`bg-cream-dark rounded-2xl p-5 border border-cream-darker shadow-warm transition-all duration-200 hover:shadow-warm-lg ${item.watched ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-xs font-sans px-2.5 py-0.5 rounded-full mb-2 font-medium ${item.type === 'Movie' ? 'bg-terracotta/15 text-terracotta-dark' : 'bg-green-light text-brown-dark'}`}>
            {item.type === 'Movie' ? '🎬 Movie' : '📺 TV Show'}
          </span>
          <h4 className={`font-serif text-xl text-brown-dark leading-snug ${item.watched ? 'line-through decoration-brown-light/50' : ''}`}>
            {item.title}
          </h4>
          <p className="text-xs text-brown-light mt-1 font-sans">
            Added by <span className="font-medium text-brown">{item.added_by}</span>
          </p>
        </div>
        <button
          onClick={onDelete}
          title="Remove"
          className="p-1.5 rounded-full text-brown-light hover:text-terracotta hover:bg-rose-light transition-colors duration-150 flex-shrink-0"
        >
          <FiTrash2 size={15} />
        </button>
      </div>

      {item.watch_date && dual && (
        <div className="mt-4 bg-cream rounded-xl px-4 py-3 border border-cream-darker">
          <p className="text-xs text-brown-light uppercase tracking-wider font-sans mb-1">Watch date</p>
          <p className="text-sm font-sans text-brown-dark font-medium">{niceDate(item.watch_date)}</p>
          <div className="mt-2 flex flex-col gap-0.5">
            <p className="text-xs text-brown-light font-sans">
              🇺🇸 <span className="font-medium">{dual.ny}</span>{' '}
              <span className="text-brown-light/60">(Hein's time)</span>
            </p>
            <p className="text-xs text-brown-light font-sans">
              🇶🇦 <span className="font-medium">{dual.qa}</span>
              {dual.nextDay && <span className="ml-1 text-terracotta">(next day)</span>}{' '}
              <span className="text-brown-light/60">(Maine's time)</span>
            </p>
          </div>
        </div>
      )}

      {!item.watched ? (
        <button
          onClick={onMarkWatched}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-green/20 text-brown-dark hover:bg-green/40 text-xs font-sans font-medium transition-colors duration-150"
        >
          <FiCheck size={13} /> Mark as Watched ✓
        </button>
      ) : (
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-sans text-green font-medium">
          <FiCheck size={12} /> Watched together ✓
        </span>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🍿</div>
      <p className="font-serif italic text-brown-light text-lg">No movies or shows yet!</p>
      <p className="font-sans text-sm text-brown-light/70 mt-2">Add something for date night 💛</p>
    </div>
  )
}
