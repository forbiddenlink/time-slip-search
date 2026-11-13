'use client'

import { motion } from 'motion/react'
import { getPersonalityDescription, type WrappedStats } from '@/lib/wrapped'
import { downloadWrappedImage } from '@/lib/share'
import { ShareIcon, CopyIcon, DownloadIcon } from '@/components/icons/Icons'

interface ShareCardProps {
  stats: WrappedStats
  onClose: () => void
}

export function ShareCard({ stats, onClose }: Readonly<ShareCardProps>) {
  const personality = getPersonalityDescription(stats.personality)

  const handleShare = async () => {
    const text = `My TimeSlip Wrapped 🎁\n\n${personality.emoji} I'm a ${personality.title}!\n\n🔍 ${stats.totalSearches} time travels\n📅 ${stats.yearsExplored.length} years explored\n🎵 ${stats.discoveries.totalSongs} songs discovered\n⭐ Favorite Era: ${stats.topDecade}\n\nExplore your own timeline at timeslipsearch.vercel.app`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My TimeSlip Wrapped',
          text,
          url: 'https://timeslipsearch.vercel.app',
        })
      } catch {
        // User cancelled or share failed, fall back to clipboard
        await navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
      }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  const handleCopyStats = async () => {
    const text = `🎁 My TimeSlip Wrapped

${personality.emoji} ${personality.title}
"${personality.description}"

📊 Stats:
• ${stats.totalSearches} searches
• ${stats.yearsExplored.length} years explored
• ${stats.discoveries.totalSongs} songs discovered
• ${stats.discoveries.totalMovies} movies found
• Favorite Era: ${stats.topDecade}

🌐 timeslipsearch.vercel.app`

    await navigator.clipboard.writeText(text)
    alert('Stats copied to clipboard!')
  }

  const handleDownload = async () => {
    const success = await downloadWrappedImage({
      personality: stats.personality,
      emoji: personality.emoji,
      title: personality.title,
      topDecade: stats.topDecade,
      totalSearches: stats.totalSearches,
      yearsExplored: stats.yearsExplored.length,
      totalSongs: stats.discoveries.totalSongs,
    }, 'twitter')

    if (!success) {
      // Fallback to text download if image generation fails
      const text = `TimeSlip Wrapped - ${personality.title}

Your Stats:
- ${stats.totalSearches} Time Travels
- ${stats.yearsExplored.length} Years Explored
- ${stats.discoveries.totalSongs} Songs Discovered
- ${stats.discoveries.totalMovies} Movies Found
- Favorite Era: ${stats.topDecade}

${personality.description}

Generated at timeslipsearch.vercel.app`

      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'timeslip-wrapped.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[500px] flex-col items-center justify-center px-6 pb-16 pt-8 text-center"
    >
      <h2 className="font-display text-4xl italic md:text-5xl">That&apos;s a wrap</h2>
      <p className="mt-2 max-w-md font-body text-lg">Send your edition to a friend.</p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={handleShare} className="ed-btn flex items-center gap-2">
          <ShareIcon size={16} />
          Share
        </button>
        <button type="button" onClick={handleCopyStats} className="ed-btn flex items-center gap-2">
          <CopyIcon size={16} />
          Copy stats
        </button>
        <button type="button" onClick={handleDownload} className="ed-btn flex items-center gap-2">
          <DownloadIcon size={16} />
          Download
        </button>
      </div>

      <div className="mt-8 w-full max-w-sm border-y-2 border-ink py-4 text-left">
        <div className="font-display text-xl">{personality.title}</div>
        <div className="ed-label text-edition">{stats.topDecade} era</div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            [stats.totalSearches, 'searches'],
            [stats.yearsExplored.length, 'years'],
            [stats.discoveries.totalSongs, 'songs'],
          ].map(([n, label]) => (
            <div key={label}>
              <dd className="font-display text-2xl">{n}</dd>
              <dt className="ed-label text-faded">{label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="ed-label mt-8 min-h-12 bg-edition px-8 py-3 text-sm text-[#fff8ea] hover:bg-[#9e1f18]"
      >
        Close
      </button>
    </motion.div>
  )
}
