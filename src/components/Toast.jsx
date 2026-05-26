// Toast notification overlay.
// Receives `toasts` array from App.jsx — App manages the state and 3s auto-dismiss.
// Each toast: { id, message, type ('success' | 'error') }

export default function Toast({ toasts }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-6 py-3 rounded-full shadow-warm-lg text-white text-sm font-sans font-medium
            animate-fade-in-up whitespace-nowrap
            ${toast.type === 'error'
              ? 'bg-brown-dark'
              : 'bg-terracotta'
            }
          `}
          role="status"
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
