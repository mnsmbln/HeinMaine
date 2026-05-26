import { useState, useCallback } from 'react'
import OurClocks     from './components/OurClocks'
import WatchTogether from './components/WatchTogether'
import LoveNotes     from './components/LoveNotes'
import OurJournal    from './components/OurJournal'
import Toast         from './components/Toast'

const TABS = [
  { id: 'clocks',  label: '🕐 Our Clocks' },
  { id: 'watch',   label: '🎬 Watch Together' },
  { id: 'notes',   label: '💌 Love Notes' },
  { id: 'journal', label: '📖 Our Journal' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('clocks')
  const [toasts, setToasts] = useState([])

  // showToast — called by child components after any Firestore write
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const handleTabClick = (id) => {
    setActiveTab(id)
    // Smooth scroll to section
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-cream font-sans">

      {/* ── Site Header ───────────────────────────────────── */}
      <header className="pt-12 pb-8 px-4 text-center">
        <h1 className="font-serif text-5xl md:text-6xl text-brown-dark tracking-wide leading-tight">
          Hein &amp; Maine
        </h1>
        <p className="mt-3 font-sans text-brown-light text-base tracking-widest uppercase text-sm">
          across the miles, close at heart
        </p>

        {/* Decorative divider */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-rose" />
          <span className="text-rose text-lg">❧</span>
          <div className="h-px w-32 bg-rose" />
          <span className="text-terracotta text-xl">🤍</span>
          <div className="h-px w-32 bg-rose" />
          <span className="text-rose text-lg">❧</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-rose" />
        </div>
      </header>

      {/* ── Sticky Tab Navigation ─────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-cream-dark shadow-warm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-sans font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-terracotta text-white shadow-warm'
                    : 'bg-cream-dark text-brown hover:bg-cream-darker hover:text-brown-dark'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-20">

        <section id="clocks">
          <SectionHeading emoji="🕐" title="Our Clocks" />
          <OurClocks />
        </section>

        <section id="watch">
          <SectionHeading emoji="🎬" title="Watch Together" />
          <WatchTogether showToast={showToast} />
        </section>

        <section id="notes">
          <SectionHeading emoji="💌" title="Love Notes" />
          <LoveNotes showToast={showToast} />
        </section>

        <section id="journal">
          <SectionHeading emoji="📖" title="Our Journal" />
          <OurJournal showToast={showToast} />
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="text-center py-12 px-4 mt-8 border-t border-cream-dark">
        <p className="font-serif italic text-brown-light text-base">
          made with love, for Hein &amp; Maine 🌍❤️
        </p>
        <p className="mt-1 text-xs text-brown-light/60 font-sans">
          your little corner of the internet ✨
        </p>
      </footer>

      {/* ── Toast Layer ───────────────────────────────────── */}
      <Toast toasts={toasts} />

    </div>
  )
}

// Reusable section heading component
function SectionHeading({ emoji, title }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-3xl text-brown-dark flex items-center gap-3">
        <span>{emoji}</span>
        <span>{title}</span>
      </h2>
      <div className="mt-2 h-0.5 w-16 bg-terracotta rounded-full" />
    </div>
  )
}
