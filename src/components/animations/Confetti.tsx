'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ConfettiProps {
  isActive: boolean
  variant?: 'celebration' | 'subtle'
}

/**
 * Retro CRT-style confetti: phosphor dots, dashes, and rectangles
 * falling like scan-line debris. Pure CSS keyframes, no libraries.
 */
export function Confetti({ isActive, variant = 'celebration' }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const COLORS = ['#40e0d0', '#ffbf00', '#f5f0e8', '#40e0d0', '#ffbf00']
  const SHAPES = ['rect', 'circle', 'dash'] as const
  const PARTICLE_COUNT = variant === 'celebration' ? 36 : 18
  const DURATION_MS = 2500

  const spawn = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // Inject scoped keyframes once
    if (!container.querySelector('style')) {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes crt-fall {
          0% {
            transform: translateY(0) rotate(var(--rot-start));
            opacity: 0.9;
          }
          70% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(var(--fall-dist)) rotate(var(--rot-end));
            opacity: 0;
          }
        }
      `
      container.appendChild(style)
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const el = document.createElement('span')
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
      const size = 2 + Math.random() * 4 // 2-6px
      const left = Math.random() * 100
      const speed = 1.6 + Math.random() * 1.2 // 1.6-2.8s
      const delay = Math.random() * 0.6
      const rotStart = Math.floor(Math.random() * 360)
      const rotEnd = rotStart + (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)
      const fallDist = 300 + Math.random() * 200

      // Shape styling
      let width: string, height: string, borderRadius: string
      switch (shape) {
        case 'circle':
          width = `${size}px`
          height = `${size}px`
          borderRadius = '50%'
          break
        case 'dash':
          width = `${size * 2.5}px`
          height = `${Math.max(1.5, size * 0.4)}px`
          borderRadius = '1px'
          break
        case 'rect':
        default:
          width = `${size}px`
          height = `${size * (0.6 + Math.random() * 0.8)}px`
          borderRadius = '1px'
          break
      }

      el.style.position = 'absolute'
      el.style.left = `${left}%`
      el.style.top = '-4px'
      el.style.width = width
      el.style.height = height
      el.style.borderRadius = borderRadius
      el.style.backgroundColor = color ?? '#40e0d0'
      el.style.boxShadow = `0 0 ${Math.round(size)}px ${color ?? '#40e0d0'}80`
      el.style.pointerEvents = 'none'
      el.style.willChange = 'transform, opacity'
      el.style.animation = `crt-fall ${speed}s ${delay}s ease-in forwards`

      el.style.setProperty('--rot-start', `${rotStart}deg`)
      el.style.setProperty('--rot-end', `${rotEnd}deg`)
      el.style.setProperty('--fall-dist', `${fallDist}px`)

      container.appendChild(el)
    }

    // Remove all particles after animation completes
    cleanupTimerRef.current = setTimeout(() => {
      if (container) {
        const particles = container.querySelectorAll('span')
        particles.forEach((p) => p.remove())
      }
    }, DURATION_MS + 400)
  }, [PARTICLE_COUNT])

  useEffect(() => {
    if (isActive) {
      spawn()
    }
    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current)
      }
    }
  }, [isActive, spawn])

  if (!isActive) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
      aria-hidden="true"
    />
  )
}
