/**
 * Achievement System - Gamification for time exploration
 */

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type AchievementCategory = 'exploration' | 'discovery' | 'social' | 'knowledge' | 'speed'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: AchievementRarity
  category: AchievementCategory
  requirement: number
  progress: number
  unlocked: boolean
  unlockedAt?: Date
  points: number
}

export interface UserAchievements {
  achievements: Achievement[]
  totalPoints: number
  unlockedCount: number
  streak: {
    current: number
    longest: number
    lastVisit: Date | null
  }
}

const STORAGE_KEY = 'timeslip_achievements'

/**
 * All available achievements
 */
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  // Exploration Achievements
  {
    id: 'first_search',
    title: 'Time Traveler',
    description: 'Complete your first time travel search',
    icon: '🚀',
    rarity: 'common',
    category: 'exploration',
    requirement: 1,
    points: 10,
  },
  {
    id: 'decade_60s',
    title: 'Swinging Sixties Scholar',
    description: 'Explore every year from 1960-1969',
    icon: '🌸',
    rarity: 'rare',
    category: 'exploration',
    requirement: 10,
    points: 100,
  },
  {
    id: 'decade_70s',
    title: 'Disco Fever',
    description: 'Explore every year from 1970-1979',
    icon: '🕺',
    rarity: 'rare',
    category: 'exploration',
    requirement: 10,
    points: 100,
  },
  {
    id: 'decade_80s',
    title: 'Totally Rad',
    description: 'Explore every year from 1980-1989',
    icon: '📼',
    rarity: 'rare',
    category: 'exploration',
    requirement: 10,
    points: 100,
  },
  {
    id: 'decade_90s',
    title: 'As If!',
    description: 'Explore every year from 1990-1999',
    icon: '💿',
    rarity: 'rare',
    category: 'exploration',
    requirement: 10,
    points: 100,
  },
  {
    id: 'time_lord',
    title: 'Time Lord',
    description: 'Visit every year from 1958-2020',
    icon: '👑',
    rarity: 'legendary',
    category: 'exploration',
    requirement: 63,
    points: 500,
  },
  
  // Discovery Achievements
  {
    id: 'music_fan',
    title: 'Music Lover',
    description: 'Discover 50 songs',
    icon: '🎵',
    rarity: 'common',
    category: 'discovery',
    requirement: 50,
    points: 50,
  },
  {
    id: 'music_historian',
    title: 'Music Historian',
    description: 'Discover 100 songs',
    icon: '🎸',
    rarity: 'rare',
    category: 'discovery',
    requirement: 100,
    points: 100,
  },
  {
    id: 'film_buff',
    title: 'Film Buff',
    description: 'Find movies from 5 different years',
    icon: '🎬',
    rarity: 'common',
    category: 'discovery',
    requirement: 5,
    points: 50,
  },
  {
    id: 'cinema_master',
    title: 'Cinema Master',
    description: 'Discover 50 movies',
    icon: '🎥',
    rarity: 'rare',
    category: 'discovery',
    requirement: 50,
    points: 100,
  },
  {
    id: 'economist',
    title: 'Economics Expert',
    description: 'Compare prices across 10 years',
    icon: '💰',
    rarity: 'common',
    category: 'discovery',
    requirement: 10,
    points: 50,
  },
  
  // Streak Achievements
  {
    id: 'week_streak',
    title: 'Weekly Wanderer',
    description: 'Visit 7 days in a row',
    icon: '🔥',
    rarity: 'rare',
    category: 'exploration',
    requirement: 7,
    points: 75,
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Visit 30 days in a row',
    icon: '⚡',
    rarity: 'epic',
    category: 'exploration',
    requirement: 30,
    points: 200,
  },
  
  // Speed Achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Explore 10 years in one session',
    icon: '⏱️',
    rarity: 'rare',
    category: 'speed',
    requirement: 10,
    points: 100,
  },
  
  // Knowledge Achievements
  {
    id: 'summer_69',
    title: 'Summer of Love',
    description: 'Discover the music of Summer 1969',
    icon: '☮️',
    rarity: 'common',
    category: 'knowledge',
    requirement: 1,
    points: 25,
  },
  {
    id: 'moonlanding',
    title: 'Moon Landing Witness',
    description: 'Explore July 1969',
    icon: '🌙',
    rarity: 'common',
    category: 'knowledge',
    requirement: 1,
    points: 25,
  },
  {
    id: 'woodstock',
    title: 'Woodstock Vibes',
    description: 'Explore August 1969',
    icon: '🎸',
    rarity: 'common',
    category: 'knowledge',
    requirement: 1,
    points: 25,
  },
]

/**
 * Initialize user achievements
 */
function initializeAchievements(): UserAchievements {
  return {
    achievements: ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      progress: 0,
      unlocked: false,
    })),
    totalPoints: 0,
    unlockedCount: 0,
    streak: {
      current: 0,
      longest: 0,
      lastVisit: null,
    },
  }
}

/**
 * Get user achievements
 */
export function getUserAchievements(): UserAchievements {
  if (typeof window === 'undefined') {
    return initializeAchievements()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const initial = initializeAchievements()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }

  try {
    const data = JSON.parse(stored)
    // Convert dates
    data.achievements = data.achievements.map((a: any) => ({
      ...a,
      unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
    }))
    if (data.streak.lastVisit) {
      data.streak.lastVisit = new Date(data.streak.lastVisit)
    }
    return data
  } catch {
    return initializeAchievements()
  }
}

/**
 * Save achievements
 */
function saveAchievements(achievements: UserAchievements): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements))
}

/**
 * Check and unlock achievements
 */
export function checkAchievements(context: {
  yearsExplored: number[]
  totalSongs: number
  totalMovies: number
  totalPrices: number
  currentYear?: number
  sessionYears?: number[]
}): Achievement[] {
  const userAchievements = getUserAchievements()
  const newlyUnlocked: Achievement[] = []

  userAchievements.achievements.forEach((achievement) => {
    if (achievement.unlocked) return

    let progress = 0

    switch (achievement.id) {
      case 'first_search':
        progress = context.yearsExplored.length > 0 ? 1 : 0
        break

      case 'decade_60s':
        progress = context.yearsExplored.filter((y) => y >= 1960 && y <= 1969).length
        break

      case 'decade_70s':
        progress = context.yearsExplored.filter((y) => y >= 1970 && y <= 1979).length
        break

      case 'decade_80s':
        progress = context.yearsExplored.filter((y) => y >= 1980 && y <= 1989).length
        break

      case 'decade_90s':
        progress = context.yearsExplored.filter((y) => y >= 1990 && y <= 1999).length
        break

      case 'time_lord':
        progress = context.yearsExplored.length
        break

      case 'music_fan':
      case 'music_historian':
        progress = context.totalSongs
        break

      case 'film_buff':
        // Count unique years with movies
        progress = new Set(context.yearsExplored).size
        break

      case 'cinema_master':
        progress = context.totalMovies
        break

      case 'economist':
        progress = Math.min(context.totalPrices, achievement.requirement)
        break

      case 'speed_demon':
        progress = context.sessionYears?.length || 0
        break

      case 'summer_69':
        progress = context.currentYear === 1969 ? 1 : 0
        break

      case 'moonlanding':
      case 'woodstock':
        progress = context.currentYear === 1969 ? 1 : 0
        break
    }

    achievement.progress = progress

    if (progress >= achievement.requirement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = new Date()
      userAchievements.totalPoints += achievement.points
      userAchievements.unlockedCount++
      newlyUnlocked.push(achievement)
    }
  })

  saveAchievements(userAchievements)
  return newlyUnlocked
}

/**
 * Update streak
 */
export function updateStreak(): void {
  const achievements = getUserAchievements()
  const now = new Date()
  const lastVisit = achievements.streak.lastVisit

  if (!lastVisit) {
    achievements.streak.current = 1
    achievements.streak.lastVisit = now
  } else {
    const daysSince = Math.floor(
      (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince === 1) {
      achievements.streak.current++
      achievements.streak.longest = Math.max(
        achievements.streak.longest,
        achievements.streak.current
      )
    } else if (daysSince > 1) {
      achievements.streak.current = 1
    }

    achievements.streak.lastVisit = now
  }

  saveAchievements(achievements)

  // Check streak achievements
  checkAchievements({
    yearsExplored: [],
    totalSongs: 0,
    totalMovies: 0,
    totalPrices: 0,
  })
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: AchievementRarity): string {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400',
  }
  return colors[rarity]
}

/**
 * Get rarity label
 */
export function getRarityLabel(rarity: AchievementRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}
