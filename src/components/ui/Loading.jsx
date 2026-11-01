/**
 * Modern, minimalist loading component.
 * Features a thin, elegant circular spinner and light, refined typography.
 * Supports variants: 'page' | 'card' | 'ai' | 'fullscreen' | 'inline'.
 */
export default function Loading({
  message = 'Loading, please wait...',
  description = null,
  variant = 'page',
  size = 'md',
  className = '',
}) {
  const isInline = variant === 'inline'
  const isFullscreen = variant === 'fullscreen'
  const isCard = variant === 'card'

  // Dimensions for the thin circular spinner
  const spinnerDimensions = {
    sm: { size: 'w-4 h-4', stroke: '1.5' },
    md: { size: 'w-8 h-8', stroke: '1.75' },
    lg: { size: 'w-11 h-11', stroke: '2' },
  }[size] || { size: 'w-8 h-8', stroke: '1.75' }

  // Inline variant (compact for buttons or small status rows)
  if (isInline) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs font-normal text-gray-500 ${className}`}>
        <svg
          className="w-3.5 h-3.5 animate-spin text-[#4F46E5] shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="text-indigo-100"
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M21 12a9 9 0 1 1-6.219-8.56"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {message && <span>{message}</span>}
      </div>
    )
  }

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-sm mx-auto select-none">
      {/* Thin, elegant circular spinner */}
      <svg
        className={`${spinnerDimensions.size} animate-spin text-[#4F46E5] shrink-0`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        {/* Subtle, thin full circle track */}
        <circle
          className="text-indigo-100"
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth={spinnerDimensions.stroke}
        />
        {/* Sleek, thin rotating arc */}
        <path
          d="M21 12a9 9 0 1 1-6.219-8.56"
          stroke="currentColor"
          strokeWidth={spinnerDimensions.stroke}
          strokeLinecap="round"
        />
      </svg>

      {/* Light, refined typography (not bold or thick) */}
      <div className="space-y-1">
        <p className="text-sm font-normal text-gray-600 tracking-normal">
          {message}
        </p>
        {description && (
          <p className="text-xs text-gray-400 font-normal leading-relaxed px-4">
            {description}
          </p>
        )}
      </div>
    </div>
  )

  // Fullscreen Overlay Variant
  if (isFullscreen) {
    return (
      <div className={`fixed inset-0 z-50 bg-white/90 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 ${className}`}>
        {spinnerContent}
      </div>
    )
  }

  // Card / Container Variant (for tables, tabs, modals)
  if (isCard) {
    return (
      <div className={`p-8 sm:p-12 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center justify-center ${className}`}>
        {spinnerContent}
      </div>
    )
  }

  // Default Page Variant
  return (
    <div className={`py-12 md:py-20 flex items-center justify-center w-full ${className}`}>
      {spinnerContent}
    </div>
  )
}

// Convenient named exports for specific contexts
export function PageLoader(props) {
  return <Loading variant="page" {...props} />
}

export function CardLoader(props) {
  return <Loading variant="card" {...props} />
}

export function AiLoader(props) {
  return <Loading variant="ai" {...props} />
}

export function FullscreenLoader(props) {
  return <Loading variant="fullscreen" {...props} />
}

export function InlineLoader(props) {
  return <Loading variant="inline" {...props} />
}
