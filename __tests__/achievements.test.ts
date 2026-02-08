import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  checkAchievements,
  getUserAchievements,
  getRarityColor,
  getRarityLabel,
  ACHIEVEMENT_DEFINITIONS
} from '@/lib/achievements'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Achievements System', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('getUserAchievements', () => {
    it('should initialize achievements on first call', () => {
      const achievements = getUserAchievements()

      expect(achievements).toBeDefined()
      expect(achievements.totalPoints).toBe(0)
      expect(achievements.unlockedCount).toBe(0)
      expect(achievements.achievements.length).toBe(ACHIEVEMENT_DEFINITIONS.length)
    })

    it('should persist to localStorage', () => {
      getUserAchievements()
      const stored = localStorageMock.getItem('timeslip_achievements')

      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.achievements).toBeDefined()
    })

    it('should load from localStorage on subsequent calls', () => {
      const first = getUserAchievements()
      // Modify data
      first.totalPoints = 100
      localStorageMock.setItem('timeslip_achievements', JSON.stringify(first))

      const second = getUserAchievements()
      expect(second.totalPoints).toBe(100)
    })
  })

  describe('checkAchievements', () => {
    it('should unlock "Time Traveler" on first search', () => {
      const newAchievements = checkAchievements({
        yearsExplored: [1987],
        totalSongs: 10,
        totalMovies: 5,
        totalPrices: 1,
      })

      const timeTraveler = newAchievements.find((a) => a.id === 'first_search')
      expect(timeTraveler).toBeDefined()
      expect(timeTraveler?.unlocked).toBe(true)
      expect(timeTraveler?.points).toBe(10)
    })

    it('should track progress for decade achievements', () => {
      checkAchievements({
        yearsExplored: [1980, 1981, 1982],
        totalSongs: 30,
        totalMovies: 0,
        totalPrices: 0,
      })

      const userAchievements = getUserAchievements()
      const decade80s = userAchievements.achievements.find((a) => a.id === 'decade_80s')

      expect(decade80s).toBeDefined()
      expect(decade80s?.progress).toBe(3)
      expect(decade80s?.unlocked).toBe(false) // Needs 10 years
    })

    it('should unlock decade achievement when all years explored', () => {
      const eighties = [1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989]

      const newAchievements = checkAchievements({
        yearsExplored: eighties,
        totalSongs: 100,
        totalMovies: 0,
        totalPrices: 0,
      })

      const decade80s = newAchievements.find((a) => a.id === 'decade_80s')
      expect(decade80s).toBeDefined()
      expect(decade80s?.title).toBe('Totally Rad')
      expect(decade80s?.unlocked).toBe(true)
    })

    it('should unlock music achievements based on song count', () => {
      const newAchievements = checkAchievements({
        yearsExplored: [1987],
        totalSongs: 50,
        totalMovies: 0,
        totalPrices: 0,
      })

      const musicLover = newAchievements.find((a) => a.id === 'music_fan')
      expect(musicLover).toBeDefined()
      expect(musicLover?.unlocked).toBe(true)
    })

    it('should not unlock music historian until 100 songs', () => {
      checkAchievements({
        yearsExplored: [1987],
        totalSongs: 75,
        totalMovies: 0,
        totalPrices: 0,
      })

      const userAchievements = getUserAchievements()
      const musicHistorian = userAchievements.achievements.find((a) => a.id === 'music_historian')

      expect(musicHistorian?.progress).toBe(75)
      expect(musicHistorian?.unlocked).toBe(false)
    })

    it('should unlock film buff when 5 different years explored', () => {
      const newAchievements = checkAchievements({
        yearsExplored: [1980, 1985, 1990, 1995, 2000],
        totalSongs: 0,
        totalMovies: 25,
        totalPrices: 0,
      })

      const filmBuff = newAchievements.find((a) => a.id === 'film_buff')
      expect(filmBuff).toBeDefined()
      expect(filmBuff?.unlocked).toBe(true)
    })

    it('should unlock knowledge achievements for specific years/months', () => {
      const newAchievements = checkAchievements({
        yearsExplored: [1969],
        totalSongs: 10,
        totalMovies: 0,
        totalPrices: 0,
        currentYear: 1969,
      })

      const summer69 = newAchievements.find((a) => a.id === 'summer_69')
      expect(summer69).toBeDefined()
      expect(summer69?.unlocked).toBe(true)
    })

    it('should track session speed for speed demon achievement', () => {
      const sessionYears = [1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989]

      const newAchievements = checkAchievements({
        yearsExplored: sessionYears,
        totalSongs: 100,
        totalMovies: 0,
        totalPrices: 0,
        sessionYears,
      })

      const speedDemon = newAchievements.find((a) => a.id === 'speed_demon')
      expect(speedDemon).toBeDefined()
      expect(speedDemon?.unlocked).toBe(true)
    })

    it('should not re-unlock already unlocked achievements', () => {
      // First unlock
      const first = checkAchievements({
        yearsExplored: [1987],
        totalSongs: 10,
        totalMovies: 0,
        totalPrices: 0,
      })

      expect(first.length).toBeGreaterThan(0)

      // Second check should not return already unlocked
      const second = checkAchievements({
        yearsExplored: [1987],
        totalSongs: 10,
        totalMovies: 0,
        totalPrices: 0,
      })

      expect(second.length).toBe(0)
    })

    it('should accumulate total points correctly', () => {
      // Unlock first achievement (10 points)
      checkAchievements({
        yearsExplored: [1987],
        totalSongs: 0,
        totalMovies: 0,
        totalPrices: 0,
      })

      let userAchievements = getUserAchievements()
      expect(userAchievements.totalPoints).toBe(10)

      // Unlock music lover (50 points)
      checkAchievements({
        yearsExplored: [1987],
        totalSongs: 50,
        totalMovies: 0,
        totalPrices: 0,
      })

      userAchievements = getUserAchievements()
      expect(userAchievements.totalPoints).toBe(60) // 10 + 50
    })
  })

  describe('getRarityColor', () => {
    it('should return correct colors for each rarity', () => {
      expect(getRarityColor('common')).toBe('text-aged-cream/60')
      expect(getRarityColor('rare')).toBe('text-blue-400')
      expect(getRarityColor('epic')).toBe('text-purple-400')
      expect(getRarityColor('legendary')).toBe('text-amber-400')
    })
  })

  describe('getRarityLabel', () => {
    it('should capitalize rarity names', () => {
      expect(getRarityLabel('common')).toBe('Common')
      expect(getRarityLabel('rare')).toBe('Rare')
      expect(getRarityLabel('epic')).toBe('Epic')
      expect(getRarityLabel('legendary')).toBe('Legendary')
    })
  })

  describe('Achievement Definitions', () => {
    it('should have all required fields for each achievement', () => {
      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        expect(achievement.id).toBeDefined()
        expect(achievement.title).toBeDefined()
        expect(achievement.description).toBeDefined()
        expect(achievement.icon).toBeDefined()
        expect(achievement.rarity).toBeDefined()
        expect(achievement.category).toBeDefined()
        expect(achievement.requirement).toBeGreaterThan(0)
        expect(achievement.points).toBeGreaterThan(0)
      })
    })

    it('should have unique IDs', () => {
      const ids = ACHIEVEMENT_DEFINITIONS.map((a) => a.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have appropriate points for rarity levels', () => {
      ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
        switch (achievement.rarity) {
          case 'common':
            expect(achievement.points).toBeLessThanOrEqual(50)
            break
          case 'rare':
            expect(achievement.points).toBeGreaterThan(50)
            expect(achievement.points).toBeLessThanOrEqual(150)
            break
          case 'epic':
            expect(achievement.points).toBeGreaterThan(150)
            expect(achievement.points).toBeLessThanOrEqual(300)
            break
          case 'legendary':
            expect(achievement.points).toBeGreaterThan(300)
            break
        }
      })
    })
  })
})
