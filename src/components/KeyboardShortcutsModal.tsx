'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ['Cmd', 'K'], description: 'Focus search' },
  { keys: ['Cmd', 'T'], description: 'Toggle timeline' },
  { keys: ['Cmd', 'W'], description: 'Time Capsule Wrapped' },
  { keys: ['Cmd', 'B'], description: 'Achievements / Badges' },
  { keys: ['Cmd', 'E'], description: 'Toggle VHS effect' },
  { keys: ['Cmd', 'P'], description: 'Toggle particles' },
  { keys: ['Cmd', '/'], description: 'Show shortcuts' },
  { keys: ['Esc'], description: 'Clear / Close' },
  { keys: ['Up', 'Down'], description: 'Navigate suggestions' },
] as const

function KeyCap({ label }: { label: string }) {
  return (
    <kbd className="inline-block min-w-[2rem] select-none border border-ink px-2 py-0.5 text-center font-label text-xs font-semibold shadow-[0_2px_0_0_#17140f]">
      {label}
    </kbd>
  )
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="ed-sheet relative max-h-[90vh] w-full max-w-lg overflow-y-auto px-5 py-5 md:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b-[3px] border-ink pb-3">
              <div>
                <p className="ed-label text-edition">Reader&apos;s guide</p>
                <h2 id="shortcuts-title" className="font-display text-3xl italic">
                  Keyboard shortcuts
                </h2>
              </div>
              <button type="button" onClick={onClose} className="ed-btn" aria-label="Close shortcuts">
                Close
              </button>
            </div>

            <dl>
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between gap-4 border-b border-ink/25 py-3"
                >
                  <dt className="font-display text-lg">{shortcut.description}</dt>
                  <dd className="flex shrink-0 items-center gap-1.5">
                    {shortcut.keys.map((key, i) => (
                      <span key={key} className="flex items-center gap-1.5">
                        {i > 0 && <span className="text-faded">+</span>}
                        <KeyCap label={key} />
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 ed-label text-faded">Press Esc to close</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
