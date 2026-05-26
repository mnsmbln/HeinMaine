import { useState, useEffect } from 'react'
import { FiExternalLink, FiMusic } from 'react-icons/fi'
import { supabase } from '../supabase'
import LoadingSpinner from './LoadingSpinner'

// ── Note card color palette ──────────────────────────────────────────────────
const NOTE_COLORS = [
  { bg: 'bg-cream-dark',   border: 'border-rose' },           // light sage
  { bg: 'bg-[#EBF0E0]',   border: 'border-[#A8C498]' },      // soft leaf
  { bg: 'bg-[#E4EDDA]',   border: 'border-terracotta/40' },  // dusty moss
  { bg: 'bg-[#EFF3E7]',   border: 'border-green' },          // warm sage
]

// ── Helpers ─────────────────────────────────────────────────────────────────
const MUSIC_DOMAINS = ['spotify.com', 'youtube.com', 'youtu.be', 'soundcloud.com', 'music.apple.com', 'tidal.com']

function isMusicLink(url) {
  return MUSIC_DOMAINS.some(d => url.toLowerCase().includes(d))
}

function formatNoteDate(ts) {
  if (!ts) return ''
  return new Intl.DateTimeFormat('en-US', {
    month:  'long',
    day:    'numeric',
    year:   'numeric',
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(ts))
}

const MAX_CHARS = 300

const DEFAULT_FORM = {
  sender:   'Hein',
  text:     '',
  link_url: '',
}

// ── Main component ──────────────────────────────────────────────────────────

export default function LoveNotes({ showToast }) {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [saving,  setSaving]  = useState(false)

  // ── Fetch data ───────────────────────────────────────────
  async function fetchNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      showToast('Could not load notes — check Supabase config', 'error')
    } else {
      setNotes(data)
    }
    setLoading(false)
  }

  // ── Real-time subscription ───────────────────────────────
  useEffect(() => {
    fetchNotes()

    const channel = supabase
      .channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, fetchNotes)
      .subscribe()

    return () => supabase.removeChannel(channel)
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

    const { error } = await supabase.from('notes').insert({
      sender:   form.sender,
      text:     form.text.trim(),
      link_url: form.link_url.trim() || null,
    })

    if (error) {
      console.error(error)
      showToast('Failed to save note — check Supabase config', 'error')
    } else {
      setForm(DEFAULT_FORM)
      showToast('Note left! 💌')
    }
    setSaving(false)
  }

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) showToast('Could not delete — try again', 'error')
    else showToast('Note removed')
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div>
      {/* ── Add form ──────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="bg-cream-dark rounded-2xl p-6 mb-8 shadow-warm border border-cream-darker"
      >
        <h3 className="font-serif text-xl text-brown-dark mb-5">Leave a little note 💌</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">From</label>
            <select
              name="sender"
              value={form.sender}
              onChange={handleChange}
              className="w-full sm:w-48 px-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
            >
              <option>Hein</option>
              <option>Maine</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">Your note</label>
            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              placeholder="Write something sweet..."
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta placeholder:text-brown-light/50 transition"
            />
            <p className={`text-right text-xs mt-1 font-sans transition-colors ${form.text.length >= MAX_CHARS ? 'text-terracotta' : 'text-brown-light/60'}`}>
              {form.text.length}/{MAX_CHARS}
            </p>
          </div>

          <div>
            <label className="block text-xs font-sans text-brown-light uppercase tracking-wider mb-1">
              Attach a song or link <span className="normal-case font-normal">(optional — Spotify, YouTube...)</span>
            </label>
            <input
              type="url"
              name="link_url"
              value={form.link_url}
              onChange={handleChange}
              placeholder="https://open.spotify.com/track/..."
              className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-darker text-brown-dark text-sm font-sans focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta placeholder:text-brown-light/50 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !form.text.trim()}
          className="mt-5 px-6 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white rounded-full text-sm font-sans font-medium transition-colors duration-200 shadow-warm disabled:opacity-50 disabled:cursor-not-allowed"
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
  const isMusic = note.link_url && isMusicLink(note.link_url)

  return (
    <div className={`relative rounded-2xl p-5 border-2 ${bg} ${border} shadow-warm hover:-translate-y-1 hover:shadow-warm-lg transition-all duration-200`}>
      <button
        onClick={onDelete}
        title="Delete note"
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-brown-light hover:text-terracotta hover:bg-rose-light text-sm font-sans transition-colors duration-150"
      >
        ×
      </button>

      <p className="font-sans text-sm text-brown-dark leading-relaxed pr-6 whitespace-pre-wrap">
        {note.text}
      </p>

      {note.link_url && (
        <a
          href={note.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-sans text-terracotta hover:text-terracotta-dark font-medium transition-colors duration-150"
        >
          {isMusic ? <><FiMusic size={11} /> Listen 🎵</> : <><FiExternalLink size={11} /> Open 🔗</>}
        </a>
      )}

      <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between gap-2">
        <span className="text-xs font-sans text-brown-light font-medium">from {note.sender} ❤️</span>
        <span className="text-xs font-sans text-brown-light/60">{formatNoteDate(note.created_at)}</span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">💌</div>
      <p className="font-serif italic text-brown-light text-lg">No notes yet...</p>
      <p className="font-sans text-sm text-brown-light/70 mt-2">leave each other a little love 🌸</p>
    </div>
  )
}
