'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BadgeDisplay, BadgeGrid } from '@/components/ui/BadgeDisplay'
import { useAuth } from '@/contexts/AuthContext'
import { useGamification } from '@/hooks/useGamification'
import { api } from '@/lib/api'
import Link from 'next/link'
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  SparklesIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'badges' | 'achievements' | 'leaderboard'
  >('overview')
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [organizedEvents, setOrganizedEvents] = useState<any[]>([])
  const [participatingEvents, setParticipatingEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  const {
    userStats,
    userBadges,
    badges,
    achievements,
    isLoading,
    error,
    getLevelInfo,
    getBadgesByCategory,
    getEarnedBadgesByCategory,
    getUnearnedBadgesByCategory,
  } = useGamification()

  // Buscar eventos inscritos
    useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoadingEvents(true)
        const response = await api.getMyEvents()
        
        const organized = (response.data as any)?.organized || []
        const participating = (response.data as any)?.participating || []
        
        // Separar eventos organizados e participações
        setOrganizedEvents(organized)
        setParticipatingEvents(participating)
        
        // Para compatibilidade, manter o allEvents também
        const allEvents = [...organized, ...participating]
        setMyEvents(allEvents)
      } catch (error) {
        console.error('Erro ao buscar eventos:', error)
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchMyEvents()
  }, [])

  if (!isAuthenticated || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Acesso Negado
          </h1>
          <p className='text-gray-600 mb-6'>
            Você precisa estar logado para acessar esta página.
          </p>
          <Button onClick={() => (window.location.href = '/login')}>
            Fazer Login
          </Button>
        </div>
      </div>
    )
  }

  const levelInfo = getLevelInfo()

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: ChartBarIcon },
    { id: 'badges', name: 'Badges', icon: TrophyIcon },
    { id: 'achievements', name: 'Conquistas', icon: StarIcon },
    { id: 'leaderboard', name: 'Ranking', icon: FireIcon },
  ]

  const renderOverview = () => (
    <div className='space-y-8'>
      {/* Profile Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='px-6 py-8 border-b border-gray-200'>
          <div className='flex items-center space-x-6'>
            <div className='flex-shrink-0'>
              {user.profile?.avatar ? (
                <img
                  className='h-20 w-20 rounded-full object-cover'
                  src={user.profile.avatar}
                  alt={`${user.first_name} ${user.last_name}`}
                />
              ) : (
                <div className='h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center'>
                  <span className='text-2xl font-medium text-gray-600'>
                    {user.first_name.charAt(0)}
                    {user.last_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <h1 className='text-2xl font-bold text-gray-900'>
                {user.first_name} {user.last_name}
              </h1>
              <p className='text-gray-600'>{user.email}</p>
              {user.profile?.bio && (
                <p className='mt-2 text-gray-700'>{user.profile.bio}</p>
              )}
            </div>
            <div className='flex-shrink-0'>
              <Button variant='outline'>Editar Perfil</Button>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className='px-6 py-6 bg-gradient-to-r from-blue-50 to-purple-50'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Nível {levelInfo.level}
              </h3>
              <p className='text-sm text-gray-600'>
                {userStats?.total_points || 0} pontos •{' '}
                {userStats?.badges_earned || 0} badges
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Próximo nível</p>
              <p className='text-lg font-semibold text-gray-900'>
                Nível {levelInfo.nextLevel}
              </p>
            </div>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3'>
            <div
              className='bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500'
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
          <p className='text-xs text-gray-500 mt-2'>
            {levelInfo.currentXP} XP • {levelInfo.xpToNext} XP para o próximo
            nível
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Eventos Participados
            </CardTitle>
            <UserGroupIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {userStats?.total_events_participated || 0}
            </div>
            <p className='text-xs text-gray-600 mt-1'>Total de participações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Eventos Organizados
            </CardTitle>
            <TrophyIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {userStats?.total_events_organized || 0}
            </div>
            <p className='text-xs text-gray-600 mt-1'>Eventos criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Horas Voluntariadas
            </CardTitle>
            <ClockIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {userStats?.total_hours_volunteered || 0}
            </div>
            <p className='text-xs text-gray-600 mt-1'>Horas de voluntariado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Sequência Atual
            </CardTitle>
            <FireIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              {userStats?.current_streak_days || 0}
            </div>
            <p className='text-xs text-gray-600 mt-1'>Dias consecutivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Meus Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center'>
              <CalendarIcon className='h-5 w-5 mr-2 text-blue-500' />
              Meus Eventos
            </div>
            <Link href='/eventos'>
              <Button variant='outline' size='sm'>
                Ver Todos
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <div className='text-center py-8 text-gray-500'>
              <p>Carregando eventos...</p>
            </div>
          ) : myEvents.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {myEvents.slice(0, 6).map((event: any) => (
                <Link key={event.id} href={`/eventos/${event.id}`}>
                  <div className='border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'>
                    {event.cover_image_url && (
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className='w-full h-32 object-cover rounded-md mb-3'
                      />
                    )}
                    <h3 className='font-semibold text-sm mb-2 line-clamp-2'>
                      {event.title}
                    </h3>
                    <div className='flex items-center text-xs text-gray-600 mb-1'>
                      <CalendarIcon className='h-3 w-3 mr-1' />
                      {new Date(event.start_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className='flex items-center text-xs text-gray-600'>
                      <MapPinIcon className='h-3 w-3 mr-1' />
                      {event.city}, {event.state}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <CalendarIcon className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>Você ainda não está inscrito em nenhum evento</p>
              <p className='text-sm mb-4'>
                Explore eventos disponíveis e participe!
              </p>
              <Link href='/eventos'>
                <Button>Explorar Eventos</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Badges */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <TrophyIcon className='h-5 w-5 mr-2 text-yellow-500' />
            Badges Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userBadges.length > 0 ? (
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {userBadges.slice(0, 4).map(userBadge => (
                <BadgeDisplay
                  key={userBadge.id}
                  name={userBadge.badge.name}
                  description={userBadge.badge.description}
                  icon={userBadge.badge.icon}
                  rarity={userBadge.badge.rarity}
                  earned={true}
                  earnedAt={userBadge.earned_at}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <TrophyIcon className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>Nenhum badge conquistado ainda</p>
              <p className='text-sm'>
                Participe de eventos para ganhar badges!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderBadges = () => (
    <div className='space-y-8'>
      {[
        'participation',
        'organization',
        'environmental',
        'social',
        'special',
      ].map(category => {
        const categoryBadges = getBadgesByCategory(category)
        const earnedBadges = getEarnedBadgesByCategory(category)
        const unearnedBadges = getUnearnedBadgesByCategory(category)

        if (categoryBadges.length === 0) return null

        return (
          <div key={category}>
            <h3 className='text-xl font-semibold text-gray-900 mb-4 capitalize'>
              {category === 'participation'
                ? 'Participação'
                : category === 'organization'
                ? 'Organização'
                : category === 'environmental'
                ? 'Ambiental'
                : category === 'social'
                ? 'Social'
                : 'Especiais'}
            </h3>
            <BadgeGrid
              badges={[
                ...earnedBadges.map(ub => ({
                  ...ub.badge,
                  earned: true,
                  earnedAt: ub.earned_at,
                })),
                ...unearnedBadges.map(badge => ({
                  ...badge,
                  earned: false,
                })),
              ]}
            />
          </div>
        )
      })}
    </div>
  )

  const renderAchievements = () => (
    <div className='space-y-8'>
      <div className='text-center py-8 text-gray-500'>
        <StarIcon className='h-12 w-12 mx-auto mb-4 text-gray-300' />
        <p>Conquistas em desenvolvimento</p>
        <p className='text-sm'>
          Em breve você poderá ver suas conquistas aqui!
        </p>
      </div>
    </div>
  )

  const renderLeaderboard = () => (
    <div className='space-y-8'>
      <div className='text-center py-8 text-gray-500'>
        <FireIcon className='h-12 w-12 mx-auto mb-4 text-gray-300' />
        <p>Ranking em desenvolvimento</p>
        <p className='text-sm'>Em breve você poderá ver o ranking aqui!</p>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Tab Navigation */}
        <div className='mb-8'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8'>
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center py-2 px-1 border-b-2 font-medium text-sm
                      ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className='h-4 w-4 mr-2' />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          </div>
        ) : error ? (
          <div className='text-center py-12 text-red-500'>
            <p>Erro ao carregar dados: {error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'badges' && renderBadges()}
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'leaderboard' && renderLeaderboard()}
          </>
        )}
      </div>
    </div>
  )
}
