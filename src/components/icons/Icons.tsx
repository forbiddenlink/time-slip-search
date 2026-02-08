/**
 * Professional SVG Icon Components
 * Replaces emoji with polished, scalable vector graphics
 */

export interface IconProps {
  className?: string
  size?: number
}

import {
  Gift,
  Trophy,
  Film,
  Sparkles,
  Zap,
  Target,
  Flame,
  Star,
  Lock,
  Unlock,
  CheckCircle,
  Share2,
  Copy,
  X,
  Music,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react'

export interface IconProps {
  className?: string
  size?: number
}

// Wrapper to ensure consistent props and styling defaults
const createIcon = (IconComponent: any) => {
  return function IconWrapper({ className = '', size = 24 }: IconProps) {
    return <IconComponent className={`${className} filter drop-shadow-sm`} size={size} strokeWidth={2} />
  }
}

export const GiftIcon = createIcon(Gift)
export const TrophyIcon = createIcon(Trophy)
export const FilmIcon = createIcon(Film)
export const SparklesIcon = createIcon(Sparkles)
export const ZapIcon = createIcon(Zap)
export const TargetIcon = createIcon(Target)
export const FlameIcon = createIcon(Flame)
export const StarIcon = createIcon(Star)
export const LockIcon = createIcon(Lock)
export const UnlockIcon = createIcon(Unlock)
export const CheckCircleIcon = createIcon(CheckCircle)
export const ShareIcon = createIcon(Share2)
export const CopyIcon = createIcon(Copy)
export const XIcon = createIcon(X)
export const MusicIcon = createIcon(Music)
export const DollarIcon = createIcon(DollarSign)
export const CalendarIcon = createIcon(Calendar)
export const DownloadIcon = createIcon(Download)
