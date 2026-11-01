import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * Modern, beautifully styled dropdown Select component.
 * Replaces native browser selects with a polished, accessible Tailwind UI.
 *
 * Usage:
 * <Select
 *   value={currentValue}
 *   onChange={(val) => setValue(val)}
 *   options={[
 *     { value: 'frontend', label: 'Frontend Developer', badge: 'Primary Choice' },
 *     { value: 'backend', label: 'Backend Developer', badge: 'Secondary Choice' }
 *   ]}
 *   placeholder="Select an option..."
 * />
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
  dropdownClassName = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  id,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Normalize options to uniform object format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: String(opt), label: String(opt) }
    }
    return {
      value: String(opt?.value ?? opt?.title ?? opt?.name ?? ''),
      label: String(opt?.label ?? opt?.title ?? opt?.name ?? opt?.value ?? ''),
      badge: opt?.badge ?? opt?.level ?? null,
      icon: opt?.icon ?? null,
      description: opt?.description ?? null,
      disabled: Boolean(opt?.disabled),
    }
  })

  // Find currently selected option object
  const selectedOption = normalizedOptions.find((opt) => opt.value === String(value))

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = (opt) => {
    if (opt.disabled || disabled) return
    onChange(opt.value)
    setIsOpen(false)
  }

  // Size styling
  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs',
    md: 'h-9 px-3.5 text-xs',
    lg: 'h-11 px-4 text-sm',
  }[size] || 'h-9 px-3.5 text-xs'

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left select-none ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border bg-white text-gray-900 shadow-2xs transition-all cursor-pointer font-bold ${sizeClasses} ${
          isOpen
            ? 'border-[#4F46E5] ring-2 ring-indigo-100 shadow-xs'
            : 'border-gray-300 hover:border-indigo-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-gray-500">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : <span className="text-gray-400 font-normal">{placeholder}</span>}
          </span>
          {selectedOption?.badge && (
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-[#4F46E5] border border-indigo-150">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#4F46E5]' : ''
          }`}
        />
      </button>

      {/* Floating Options Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 mt-1.5 w-full min-w-[220px] rounded-2xl bg-white border border-gray-200/90 p-1.5 shadow-xl shadow-indigo-100/50 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto ${dropdownClassName}`}
          role="listbox"
        >
          {normalizedOptions.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-400 italic">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === String(value)
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/90 text-[#4F46E5] font-bold'
                      : opt.disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-slate-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <div className="truncate">
                      <div className="truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[10px] text-gray-500 font-normal truncate mt-0.5">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {opt.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-indigo-100/90 text-[#4F46E5]'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#4F46E5] stroke-[2.5]" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
