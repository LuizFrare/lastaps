'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { usePushNotifications } from './usePushNotifications'

interface Badge {
  id: number
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category:
    | 'participation'
    | 'organization'
    | 'environmental'
    | 'social'
    | 'special'
  requirements: {
    min_events?: number
    min_hours?: number
    min_participants?: number
    specific_actions?: string[]
    consecutive_days?: number
  }
  points: number
  is_active: boolean
}

interface UserBadge {
  id: number
  badge: Badge
  earned_at: string
  progress: number
  max_progress: number
}

interface UserStats {
  total_events_participated: number
  total_events_organized: number
  total_hours_volunteered: number
  total_participants_attracted: number
  current_streak_days: number
  longest_streak_days: number
  badges_earned: number
  total_points: number
  level: number
  experience_points: number
  experience_to_next_level: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  unlocked_at?: string
  progress: number
  max_progress: number
}

export function useGamification() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { isAuthenticated } = useAuth()
  const { notifyBadgeEarned } = usePushNotifications()

  // Load all available badges
  const loadBadges = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      // TODO: Endpoint /api/badges/ não existe ainda no backend
      setBadges([])
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Erro ao carregar badges')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load user's badges
  const loadUserBadges = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      setError(null)
      console.log('🔄 Carregando badges do usuário...')
      const response = await api.getUserBadges()
      console.log('🏆 Badges recebidos:', response.data)
      
      const badgesData = Array.isArray(response.data) 
        ? response.data 
        : ((response.data as { results?: UserBadge[] }).results || [])
      
      setUserBadges(badgesData)
    } catch (err: unknown) {
      const error = err as Error
      console.error('❌ Erro ao carregar badges:', error)
      setError(error.message || 'Erro ao carregar badges do usuário')
      setUserBadges([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Load user stats
  const loadUserStats = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      setError(null)
      console.log('🔄 Carregando estatísticas do usuário...')
      const response = await api.getUserStats()
      console.log('📊 Estatísticas recebidas:', response.data)
      setUserStats(response.data as UserStats)
    } catch (err: unknown) {
      const error = err as Error
      console.error('❌ Erro ao carregar estatísticas:', error)
      setError(error.message || 'Erro ao carregar estatísticas')
      
      // Definir stats padrão em caso de erro
      setUserStats({
        total_events_participated: 0,
        total_events_organized: 0,
        total_hours_volunteered: 0,
        total_participants_attracted: 0,
        current_streak_days: 0,
        longest_streak_days: 0,
        badges_earned: 0,
        total_points: 0,
        level: 1,
        experience_points: 0,
        experience_to_next_level: 100,
      })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // Load achievements
  const loadAchievements = useCallback(async () => {
    // TODO: Implementar quando o backend tiver endpoints de conquistas
    setAchievements([])
  }, [])

  // Load all data
  useEffect(() => {
    if (!isAuthenticated) return

    Promise.all([
      loadBadges(),
      loadUserBadges(),
      loadUserStats(),
      loadAchievements(),
    ])
  }, [loadBadges, loadUserBadges, loadUserStats, loadAchievements, isAuthenticated])

  // Check and award new badges
  const checkAndAwardBadges = useCallback(
    async (eventData: { type: string; data: unknown }) => {
      if (!isAuthenticated || !badges.length) return

      try {
        // Recarregar stats após ação
        await loadUserStats()
      } catch (error) {
        console.error('Erro ao verificar badges:', error)
      }
    },
    [badges, isAuthenticated, loadUserStats]
  )

  // Get level information
  const getLevelInfo = useCallback(() => {
    if (!userStats) {
      return {
        level: 1,
        nextLevel: 2,
        currentXP: 0,
        xpToNext: 100,
        progress: 0,
      }
    }

    const level = userStats.level || 1
    const xp = userStats.experience_points || 0
    const xpToNext = userStats.experience_to_next_level || 100

    return {
      level,
      nextLevel: level + 1,
      currentXP: xp,
      xpToNext,
      progress: (xp / xpToNext) * 100,
    }
  }, [userStats])

  // Get badges by category
  const getBadgesByCategory = useCallback(
    (category: string) => {
      return badges.filter(badge => badge.category === category)
    },
    [badges]
  )

  // Get earned badges by category
  const getEarnedBadgesByCategory = useCallback(
    (category: string) => {
      return userBadges.filter(
        userBadge => userBadge.badge.category === category
      )
    },
    [userBadges]
  )

  // Get unearned badges by category
  const getUnearnedBadgesByCategory = useCallback(
    (category: string) => {
      const earnedBadgeIds = userBadges.map(ub => ub.badge.id)
      return badges.filter(
        badge =>
          badge.category === category && !earnedBadgeIds.includes(badge.id)
      )
    },
    [badges, userBadges]
  )

  return {
    badges,
    userBadges,
    userStats,
    achievements,
    isLoading,
    error,
    checkAndAwardBadges,
    getLevelInfo,
    getBadgesByCategory,
    getEarnedBadgesByCategory,
    getUnearnedBadgesByCategory,
  }
}
