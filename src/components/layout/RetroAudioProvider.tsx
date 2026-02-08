"use client"

import { useEffect } from 'react'
import { useRetroAudio } from '@/hooks/useRetroAudio'
import { usePathname, useSearchParams } from 'next/navigation'

export function RetroAudioProvider({ children }: { children: React.ReactNode }) {
    const { playPowerOn, playClick, playStaticBurst } = useRetroAudio()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Play power on sound on mount
    useEffect(() => {
        // Small delay to ensure interaction context is likely ready or just to be polite
        const timer = setTimeout(() => {
            playPowerOn()
        }, 500)
        return () => clearTimeout(timer)
    }, [playPowerOn])

    // Play static burst on navigation (simulating channel change)
    useEffect(() => {
        if (pathname) {
            playStaticBurst()
        }
    }, [pathname, searchParams, playStaticBurst])

    // Add global click listener for UI feedback
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            // Only play click for interactive elements
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.getAttribute('role') === 'button'
            ) {
                playClick()
            }
        }

        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [playClick])

    return <>{children}</>
}
