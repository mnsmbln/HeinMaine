import { useState, useEffect } from 'react'
import { FiExternalLink, FiMusic } from 'react-icons/fi'
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

// ── Note card color palette (cycles by index) ───────────────────────────────
// All muted, earthy, warm tones
const NOTE_COLORS = [
  { bg: 'bg-cream-dark',       border: 'border-rose' },           // cream
  { bg: 'bg-[#FFF9ED]',        border: 'border-[#E8C98A]' },      // warm honey
  { bg: 'bg-[#F5EDEB]',        border: 'border-terracotta/40' },  // dusty peach
  { bg: 'bg-[#EEF3EE]',        border: 'border-green' },          // sage
]

// ── Helpers ─────────────────────────────────────────────────────────────────

const MUSIC_DOMAINS = ['spotify.com', 'youtube.com', 'youtu.be', 'soundcloud.com', 'music.apple.com', 'tidal.com', 'deezer.com']

function isMusicLink(url) {
  return MUSIC_DOMAINS.some(d => url.toLowerCase().includes(d))
}

function formatNoteDate(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
    hour:  'numeric',
    minute:'2-digit',
    hour12: true,
  }).format(date)
}

// ── Default form ─────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  from:    'Hein',
  text:    '',
  linkUrl: '',
}

const MAX_CHARS = 300

// ── Main component ──────────────────────────────────────────────────────────

export default function LoveNotes({ showToast }) {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [saving,  setSaving]  = useState(false)

  // ── Real-time listener ───────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Notes error:', err)
        showToast('Could not load notes — check Firebase config', 'error')
        setLoading(false)
      }
    )
    return () => unsub()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Form handlers ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'text' && value.length > MAX_CHARS) return
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.text.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'notes'), {
        from:      form.from,
        text:      form.text.trim(),
        linkUrl:   form.linkUrl.trim(),
        createdAt: serverTimestamp(),
      })
      setForm(DEFAULT_FORM)
      showToast('Note left! 💌')
    } catch (err) {
      console.error(err)
      showToast('Failed to save note — check Firebase config', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id))
      showToast('Note removed')
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
          Leave a little note 💌
        </h3>

        <div className="space-y-4">
          {/* From */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              From
            </label>
            <select
              name="from"
              value={form.from}
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

          {/* Note text */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Your note
            </label>
            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              placeholder="Write something sweet..."
              rows={4}
              required
              className="
                w-full px-4 py-3 rounded-xl bg-cream border border-cream-darker
                text-brown-dark text-sm font-sans leading-relaxed resize-none
                focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                placeholder:text-brown-light/50
                transition
              "
            />
            <p className={`text-right text-xs mt-1 font-sans transition-colors ${
              form.text.length >= MAX_CHARS ? 'text-terracotta' : 'text-brown-light/60'
            }`}>
              {form.text.length}/{MAX_CHARS}
            </p>
          </div>

          {/* Song / link */}
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Attach a song or link{' '}
              <span className="normal-case font-normal">(optional — Spotify, YouTube...)</span>
            </label>
            <input
              type="url"
              name="linkUrl"
              value={form.linkUrl}
              onChange={handleChange}
              placeholder="https://open.spotify.com/track/..."
              className="
                w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker
                text-brown-dark text-sm font-sans
                focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta
                placeholder:text-brown-light/50
                transition
              "
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !form.text.trim()}
          className="
            mt-5 px-6 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white
            rounded-full text-sm font-sans font-medium
            transition-colors duration-200 shadow-warm
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving ? 'Sending...' : 'Leave a note 💌'}
        </button>
      </form>

      {/* ── Notes wall ────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner message="Loading your notes..." />
      ) : notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="masonry-grid">
          {notes.map((note, index) => (
            <div key={note.id} className="masonry-item">
              <NoteCard
                note={note}
                colorIndex={index}
                onDelete={() => deleteNote(note.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Note card ───────────────────────────────────────────────────────────────

function NoteCard({ note, colorIndex, onDelete }) {
  const { bg, border } = NOTE_COLORS[colorIndex % NOTE_COLORS.length]
  const isMusic = note.linkUrl && isMusicLink(note.linkUrl)

  return (
    <div
      className={`
        relative rounded-2xl p-5 border-2
        ${bg} ${border}
        shadow-warm
        hover:-translate-y-1 hover:shadow-warm-lg
        transition-all duration-200
      `}
    >
      {/* Delete button */}
      <button
        onClick={onDelete}
        title="Delete note"
        className="
          absolute top-3 right-3
          w-6 h-6 flex items-center justify-center
          rounded-full text-brown-light hover:text-terracotta hover:bg-rose-light
          text-sm font-sans transition-colors duration-150
        "
        aria-label="Delete note"
      >
        ×
      </button>

      {/* Note text */}
      <p className="font-sans text-sm text-brown-dark leading-relaxed pr-6 whitespace-pre-wrap">
        {note.text}
      </p>

      {/* Link button */}
      {note.linkUrl && (
        <a
          href={note.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-3 inline-flex items-center gap-1.5
            text-xs font-sans text-terracotta hover:text-terracotta-dark
            font-medium transition-colors duration-150
          "
        >
          {isMusic
            ? <><FiMusic size={11} /> Listen 🎵</>
            : <><FiExternalLink size={11} /> Open 🔗</>
          }
        </a>
      )}

      {/* Footer: from + date */}
      <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between gap-2">
        <span className="text-xs font-sans text-brown-light font-medium">
          from {note.from} ❤️
        </span>
        <span className="text-xs font-sans text-brown-light/60">
          {formatNoteDate(note.createdAt)}
        </span>
      </div>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">💌</div>
      <p className="font-serif italic text-brown-light text-lg">
        No notes yet...
      </p>
      <p className="font-sans text-sm text-brown-light/70 mt-2">
        leave each other a little love 🌸
      </p>
    </div>
  )
}
