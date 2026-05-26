export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div
        className="w-10 h-10 rounded-full border-4 border-cream-dark border-t-terracotta animate-spin"
        role="status"
        aria-label={message}
      />
      <p className="text-brown-light text-sm font-sans">{message}</p>
    </div>
  )
}
