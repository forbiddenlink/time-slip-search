'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  emoji: string
}

interface ParticleEffectProps {
  year: number
  isActive?: boolean
}

export function ParticleEffect({ year, isActive = true }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  // Determine era-specific emojis
  const getEraEmojis = (year: number): string[] => {
    if (year >= 2010) return ['💻', '📱', '🎮', '🚀', '⚡']
    if (year >= 2000) return ['💿', '📀', '🎧', '🌐', '✨']
    if (year >= 1990) return ['📼', '💾', '🎮', '📟', '⭐']
    if (year >= 1980) return ['🎸', '🎹', '🎤', '🌟', '💫']
    if (year >= 1970) return ['🌼', '☮️', '🎵', '🌈', '✌️']
    if (year >= 1960) return ['🎭', '🎬', '📻', '🎪', '🌙']
    return ['⏰', '📜', '🕰️', '📖', '🔮']
  }

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    const emojis = getEraEmojis(year)
    
    // Create initial particles
    const initialParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 20 + 15,
      emoji: emojis[Math.floor(Math.random() * emojis.length)] ?? '✨',
    }))

    setParticles(initialParticles)

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => {
          let newX = particle.x + particle.vx
          let newY = particle.y + particle.vy
          let newVx = particle.vx
          let newVy = particle.vy

          // Bounce off edges
          if (newX <= 0 || newX >= 100) {
            newVx = -particle.vx
            newX = Math.max(0, Math.min(100, newX))
          }
          if (newY <= 0 || newY >= 100) {
            newVy = -particle.vy
            newY = Math.max(0, Math.min(100, newY))
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          }
        })
      )
    }, 50)

    return () => clearInterval(interval)
  }, [year, isActive])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  )
}

interface ConfettiEffectProps {
  isActive?: boolean
  duration?: number
}

export function ConfettiEffect({ isActive = false, duration = 3000 }: ConfettiEffectProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([])

  useEffect(() => {
    if (!isActive) {
      setPieces([])
      return
    }

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
    
    const confetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)] ?? '#FFF',
    }))

    setPieces(confetti)

    const timer = setTimeout(() => {
      setPieces([])
    }, duration)

    return () => clearTimeout(timer)
  }, [isActive, duration])

  if (!isActive) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${piece.x}%`,
            top: '-10%',
            backgroundColor: piece.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 100,
            opacity: 0,
            rotate: 720,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}
