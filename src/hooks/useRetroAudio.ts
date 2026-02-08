"use client"

import { useEffect, useRef, useCallback } from 'react'

export function useRetroAudio() {
    const audioContextRef = useRef<AudioContext | null>(null)

    // Initialize AudioContext on first user interaction or mount
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext
                if (AudioContext) {
                    audioContextRef.current = new AudioContext()
                }
            }
        }

        // Modern browsers require user interaction to start AudioContext
        document.addEventListener('click', initAudio, { once: true })
        document.addEventListener('keydown', initAudio, { once: true })

        // Try to init immediately just in case (for some browsers)
        initAudio()

        return () => {
            // Cleanup if needed
            if (audioContextRef.current?.state !== 'closed') {
                audioContextRef.current?.close()
            }
        }
    }, [])

    const playPowerOn = useCallback(() => {
        const ctx = audioContextRef.current
        if (!ctx) return

        // Resume if suspended (browser policy)
        if (ctx.state === 'suspended') ctx.resume()

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        // Sine sweep up (CRT power up sound)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(50, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(15000, ctx.currentTime + 1.5)

        // Volume envelope
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)

        osc.start()
        osc.stop(ctx.currentTime + 1.5)
    }, [])

    const playClick = useCallback(() => {
        const ctx = audioContextRef.current
        if (!ctx) return
        if (ctx.state === 'suspended') ctx.resume()

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        // Short high-pitch blip
        osc.type = 'square'
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05)

        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

        osc.start()
        osc.stop(ctx.currentTime + 0.05)
    }, [])

    const playStaticBurst = useCallback(() => {
        const ctx = audioContextRef.current
        if (!ctx) return
        if (ctx.state === 'suspended') ctx.resume()

        const bufferSize = ctx.sampleRate * 0.5 // 0.5 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
        }

        const noise = ctx.createBufferSource()
        noise.buffer = buffer

        const gain = ctx.createGain()
        noise.connect(gain)
        gain.connect(ctx.destination)

        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

        noise.start()
    }, [])

    return { playPowerOn, playClick, playStaticBurst }
}
