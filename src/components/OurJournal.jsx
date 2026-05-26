import { useState, useEffect } from 'react'
import { FiTrash2, FiSearch, FiMusic } from 'react-icons/fi'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
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
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
    hour:    'numeric',
    minute:  '2-digit',
    hour12:  true,
  }).format(date)
}

// ── Default form ─────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  writtenBy: 'Hein',
  title:     '',
  content:   '',
  mood:      '🥰',
  songUrl:   '',
}

// ── Main component ───────────────────────────────────────────────────────────

export default function OurJournal({ showToast }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [saving,  setSaving]  = useState(false)
  const [search,  setSearch]  = useState('')

  // ── Real-time listener ───────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'journal'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Journal error:', err)
        showToast('Could not load journal — check Firebase config', 'error')
        setLoading(false)
      }
    )
    return () => unsub()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Client-side search ───────────────────────────────────
  const filtered = search.trim()
    ? entries.filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.content?.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  // ── Form handlers ────────────────────────────────────────
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleMood = (emoji) => {
    setForm(prev => ({ ...prev, mood: emoji }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'journal'), {
        writtenBy: form.writtenBy,
        title:     form.title.trim(),
        content:   form.content.trim(),
        mood:      form.mood,
        songUrl:   form.songUrl.trim(),
        createdAt: serverTimestamp(),
      })
      setForm(DEFAULT_FORM)
      showToast('Memory saved! 📖')
    } catch (err) {
      console.error(err)
      showToast('Failed to save — check Firebase config', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id, title) => {
    try {
      await deleteDoc(doc(db, 'journal', id))
      showToast(`"${title}" deleted`)
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
        <h3 className="font-serif text-xl text-brown-dark mb-5">
          Save a memory 📖
        </h3>

        <div className="space-y-4">
          {/* Written by */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Written by
            </label>
            <select
              name="writtenBy"
              value={form.writtenBy}
              onChange={handleChange}
              className="
                w-full sm:w-48 px-4 py-2.5 rounded-xl bg-cream border border-cream-darker
                text-brown-dark text-sm font-sans
                focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                transition
              "
            >
              <option>Hein</option>
              <option>Maine</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Our first video call of the week"
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

          {/* Content */}
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
              className="
                w-full px-4 py-3 rounded-xl bg-cream border border-cream-darker
                text-brown-dark text-sm font-sans leading-relaxed resize-y
                focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                placeholder:text-brown-light/50
                transition
              "
            />
          </div>

          {/* Mood picker */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-2">
              Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  title={label}
                  onClick={() => handleMood(emoji)}
                  className={`
                    text-2xl p-2 rounded-xl transition-all duration-150
                    ${form.mood === emoji
                      ? 'ring-2 ring-terracotta scale-110 bg-cream shadow-warm'
                      : 'hover:scale-105 hover:bg-cream opacity-70 hover:opacity-100'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Song */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Song that's playing{' '}
              <span className="normal-case font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FiMusic className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light" size={14} />
              <input
                type="text"
                name="songUrl"
                value={form.songUrl}
                onChange={handleChange}
                placeholder="Song title or Spotify/YouTube link"
                className="
                  w-full pl-9 pr-4 py-2.5 rounded-xl bg-cream border border-cream-darker
                  text-brown-dark text-sm font-sans
                  focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                  placeholder:text-brown-light/50
                  transition
                "
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !form.title.trim() || !form.content.trim()}
          className="
            mt-5 px-6 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white
            rounded-full text-sm font-sans font-medium
            transition-colors duration-200 shadow-warm
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving ? 'Saving...' : 'Save memory 📖'}
        </button>
      </form>

      {/* ── Search ────────────────────────────────────────── */}
      {!loading && entries.length > 0 && (
        <div className="relative mb-6">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories by title or content..."
            className="
              w-full pl-11 pr-4 py-3 rounded-xl bg-cream-dark border border-cream-darker
              text-brown-dark text-sm font-sans
              focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
              placeholder:text-brown-light/50
              transition
            "
          />
        </div>
      )}

      {/* ── Entries list ──────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Loading your journal..." />
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif italic text-brown-light">
            No entries match "{search}"
          </p>
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
  const isLink = entry.songUrl?.startsWith('http')

  return (
    <div
      className="
        bg-cream-dark rounded-2xl p-6 md:p-8
        border-l-4 border-terracotta
        shadow-warm hover:shadow-warm-lg
        transition-shadow duration-200
        relative
      "
    >
      {/* Mood emoji — top right */}
      <span
        className="absolute top-5 right-5 text-4xl select-none"
        title={entry.mood}
      >
        {entry.mood}
      </span>

      {/* Title */}
      <h4 className="font-serif text-2xl text-brown-dark leading-snug pr-14">
        {entry.title}
      </h4>

      {/* Author + date */}
      <p className="mt-1 text-xs font-sans text-brown-light/70">
        Written by{' '}
        <span className="font-medium text-brown-light">{entry.writtenBy}</span>
        {entry.createdAt && (
          <> · {formatEntryDate(entry.createdAt)}</>
        )}
      </p>

      {/* Content */}
      <p className="mt-4 font-sans text-sm text-brown-dark leading-relaxed whitespace-pre-wrap">
        {entry.content}
      </p>

      {/* Song */}
      {entry.songUrl && (
        <div className="mt-4 flex items-center gap-2">
          <FiMusic size={13} className="text-terracotta flex-shrink-0" />
          {isLink ? (
            <a
              href={entry.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-sans text-terracotta hover:text-terracotta-dark transition-colors truncate"
            >
              {entry.songUrl}
            </a>
          ) : (
            <span className="text-xs font-sans text-brown-light italic">
              {entry.songUrl}
            </span>
          )}
        </div>
      )}

      {/* Delete button */}
      <button
        onClick={onDelete}
        title="Delete entry"
        className="
          mt-5 flex items-center gap-1.5 text-xs font-sans text-brown-light/60
          hover:text-terracotta transition-colors duration-150
        "
      >
        <FiTrash2 size={12} />
        Delete entry
      </button>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🌙</div>
      <p className="font-serif italic text-brown-light text-lg">
        No memories yet
      </p>
      <p className="font-sans text-sm text-brown-light/70 mt-2">
        Start writing your story together 💛
      </p>
    </div>
  )
}
