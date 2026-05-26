import { useState, useEffect } from 'react'
import { FiTrash2, FiSearch, FiMusic } from 'react-icons/fi'
import { supabase } from '../supabase'
import LoadingSpinner from './LoadingSpinner'

// ── Mood options ─────────────────────────────────────────────────────────────
const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😍', label: 'In love' },
  { emoji: '😢', label: 'Missing you' },
  { emoji: '😴', label: 'Sleepy' },
  { emoji: '🥰', label: 'Soft & warm' },
  { emoji: '😂', label: 'Laughing' },
  { emoji: '🌙', label: 'Late night' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatEntryDate(ts) {
  if (!ts) return ''
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  }).format(new Date(ts))
}

// ── Default form ─────────────────────────────────────────────────────────────
const DEFAULT_FORM = {
  written_by: 'Hein',
  title:      '',
  content:    '',
  mood:       '🥰',
  song_url:   '',
}

// ── Main component ───────────────────────────────────────────────────────────

export default function OurJournal({ showToast }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [saving,  setSaving]  = useState(false)
  const [search,  setSearch]  = useState('')

  // ── Fetch data ───────────────────────────────────────────
  async function fetchEntries() {
    const { data, error } = await supabase
      .from('journal')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      showToast('Could not load journal — check Supabase config', 'error')
    } else {
      setEntries(data)
    }
    setLoading(false)
  }

  // ── Real-time subscription ───────────────────────────────
  useEffect(() => {
    fetchEntries()

    const channel = supabase
      .channel('journal-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal' }, fetchEntries)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Client-side search ───────────────────────────────────
  const filtered = search.trim()
    ? entries.filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.content?.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  // ── Form handlers ────────────────────────────────────────
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const handleMood   = (emoji) => setForm(prev => ({ ...prev, mood: emoji }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)

    const { error } = await supabase.from('journal').insert({
      written_by: form.written_by,
      title:      form.title.trim(),
      content:    form.content.trim(),
      mood:       form.mood,
      song_url:   form.song_url.trim() || null,
    })

    if (error) {
      console.error(error)
      showToast('Failed to save — check Supabase config', 'error')
    } else {
      setForm(DEFAULT_FORM)
      showToast('Memory saved! 📖')
    }
    setSaving(false)
  }

  const deleteEntry = async (id, title) => {
    const { error } = await supabase.from('journal').delete().eq('id', id)
    if (error) showToast('Could not delete — try again', 'error')
    else showToast(`"${title}" deleted`)
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div>
      {/* ── Add form ──────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="bg-cream-dark rounded-2xl p-6 mb-8 shadow-warm border border-cream-darker"
      >
        <h3 className="font-serif text-xl text-brown-dark mb-5">Save a memory 📖</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">Written by</label>
            <select
              name="written_by"
              value={form.written_by}
              onChange={handleChange}
              className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
            >
              <option>Hein</option>
              <option>Maine</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Our first video call of the week"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta placeholder:text-brown-light/50 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              What happened / what you're feeling
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write as much or as little as you want..."
              rows={5}
              required
              className="w-full px-4 py-3 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta placeholder:text-brown-light/50 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-2">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  title={label}
                  onClick={() => handleMood(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all duration-150 ${
                    form.mood === emoji
                      ? 'ring-2 ring-terracotta scale-110 bg-cream shadow-warm'
                      : 'hover:scale-105 hover:bg-cream opacity-70 hover:opacity-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Song that's playing <span className="normal-case font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FiMusic className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light" size={14} />
              <input
                type="text"
                name="song_url"
                value={form.song_url}
                onChange={handleChange}
                placeholder="Song title or Spotify/YouTube link"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta placeholder:text-brown-light/50 transition"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !form.title.trim() || !form.content.trim()}
          className="mt-5 px-6 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white rounded-full text-sm font-sans font-medium transition-colors duration-200 shadow-warm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save memory 📖'}
        </button>
      </form>

      {/* ── Search ────────────────────────────────────────── */}
      {!loading && entries.length > 0 && (
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories by title or content..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-cream-dark border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta placeholder:text-brown-light/50 transition"
          />
        </div>
      )}

      {/* ── Entries ───────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Loading your journal..." />
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif italic text-brown-light">No entries match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map(entry => (
            <JournalEntry
              key={entry.id}
              entry={entry}
              onDelete={() => deleteEntry(entry.id, entry.title)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Journal entry card ───────────────────────────────────────────────────────

function JournalEntry({ entry, onDelete }) {
  const isLink = entry.song_url?.startsWith('http')

  return (
    <div className="bg-cream-dark rounded-2xl p-6 md:p-8 border-l-4 border-terracotta shadow-warm hover:shadow-warm-lg transition-shadow duration-200 relative">
      <span className="absolute top-5 right-5 text-4xl select-none">{entry.mood}</span>

      <h4 className="font-serif text-2xl text-brown-dark leading-snug pr-14">{entry.title}</h4>

      <p className="mt-1 text-xs font-sans text-brown-light/70">
        Written by <span className="font-medium text-brown-light">{entry.written_by}</span>
        {entry.created_at && <> · {formatEntryDate(entry.created_at)}</>}
      </p>

      <p className="mt-4 font-sans text-sm text-brown-dark leading-relaxed whitespace-pre-wrap">
        {entry.content}
      </p>

      {entry.song_url && (
        <div className="mt-4 flex items-center gap-2">
          <FiMusic size={13} className="text-terracotta flex-shrink-0" />
          {isLink ? (
            <a
              href={entry.song_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-sans text-terracotta hover:text-terracotta-dark transition-colors truncate"
            >
              {entry.song_url}
            </a>
          ) : (
            <span className="text-xs font-sans text-brown-light italic">{entry.song_url}</span>
          )}
        </div>
      )}

      <button
        onClick={onDelete}
        className="mt-5 flex items-center gap-1.5 text-xs font-sans text-brown-light/60 hover:text-terracotta transition-colors duration-150"
      >
        <FiTrash2 size={12} /> Delete entry
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🌙</div>
      <p className="font-serif italic text-brown-light text-lg">No memories yet</p>
      <p className="font-sans text-sm text-brown-light/70 mt-2">Start writing your story together 💛</p>
    </div>
  )
}
