'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getDatePreview, type DatePreview } from '@/lib/date-parser'
import { DateSuggestions } from './DateSuggestions'

interface TemporalInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
  showPreview?: boolean
  className?: string
}

export function TemporalInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter a date, year, or era...',
  disabled = false,
  showPreview = true,
  className = '',
}: Readonly<TemporalInputProps>) {
  const [preview, setPreview] = useState<DatePreview | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced preview generation
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!value.trim()) {
      setPreview(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      const datePreview = getDatePreview(value)
      setPreview(datePreview)
    }, 150)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit) {
        e.preventDefault()
        setShowSuggestions(false)
        onSubmit()
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
      }
    },
    [onSubmit]
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (value.length > 0) {
      setShowSuggestions(true)
    }
  }, [value])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200)
  }, [])

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      onChange(suggestion)
      setShowSuggestions(false)
      inputRef.current?.focus()
    },
    [onChange]
  )

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low'): string => {
    switch (confidence) {
      case 'high':
        return 'text-phosphor-green'
      case 'medium':
        return 'text-phosphor-amber'
      case 'low':
        return 'text-vhs-red'
    }
  }

  const getConfidenceLabel = (confidence: 'high' | 'medium' | 'low'): string => {
    switch (confidence) {
      case 'high':
        return 'CONFIRMED'
      case 'medium':
        return 'INTERPRETED'
      case 'low':
        return 'UNCERTAIN'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          if (e.target.value.length > 0) {
            setShowSuggestions(true)
          }
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Enter a date to search"
        aria-describedby={preview ? 'date-preview' : undefined}
        className="w-full bg-crt-black text-aged-cream placeholder-aged-cream/30
                   border-2 border-crt-light/40 rounded px-4 py-3
                   focus:outline-none input-glow transition-all
                   led-text text-lg tracking-wide"
      />

      {/* Date Preview Badge */}
      {showPreview && preview && preview.parsed && isFocused && (
        <div
          id="date-preview"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
        >
          <span
            className={`text-xs led-text tracking-wider ${getConfidenceColor(preview.confidence)}`}
          >
            {getConfidenceLabel(preview.confidence)}
          </span>
          <span className="text-aged-cream/60 text-sm">
            {preview.parsed.display}
          </span>
        </div>
      )}

      {/* Historical Context */}
      {showPreview && preview?.parsed?.isHistorical && preview.parsed.historicalContext && (
        <div className="absolute left-0 right-0 -bottom-8">
          <div className="flex items-center gap-2 text-xs text-phosphor-teal/80">
            <span className="led-text">ERA:</span>
            {preview.parsed.historicalContext.slice(0, 2).map((ctx, i) => (
              <span key={i} className="px-2 py-0.5 bg-phosphor-teal/10 rounded text-phosphor-teal">
                {ctx}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Date Suggestions Dropdown */}
      {showSuggestions && preview && (
        <DateSuggestions
          preview={preview}
          onSelect={handleSuggestionSelect}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}
