'use client'

import React from 'react'
import { Badge } from './Badge'
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  SparklesIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'

interface BadgeDisplayProps {
  name: string
  description: string
  icon?: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  earned?: boolean
  earnedAt?: string
  progress?: number
  maxProgress?: number
  className?: string
}

const badgeIcons = {
  trophy: TrophyIcon,
  star: StarIcon,
  fire: FireIcon,
  heart: HeartIcon,
  lightbulb: LightBulbIcon,
  shield: ShieldCheckIcon,
  sparkles: SparklesIcon,
  academic: AcademicCapIcon,
}

const rarityColors = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  uncommon: 'bg-green-100 text-green-800 border-green-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const rarityGradients = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-green-400 to-green-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-yellow-400 to-yellow-500',
}

export function BadgeDisplay({
  name,
  description,
  icon = 'trophy',
  rarity,
  earned = false,
  earnedAt,
  progress = 0,
  maxProgress = 1,
  className = '',
}: BadgeDisplayProps) {
  const IconComponent =
    badgeIcons[icon as keyof typeof badgeIcons] || TrophyIcon
  const progressPercentage =
    maxProgress > 0 ? (progress / maxProgress) * 100 : 0

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300 hover:scale-105
        ${earned ? 'opacity-100' : 'opacity-60'}
        ${className}
      `}
    >
      <div
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-300
          ${rarityColors[rarity]}
          ${earned ? 'shadow-lg' : 'shadow-md'}
          ${earned ? 'ring-2 ring-opacity-50' : ''}
          ${
            earned
              ? `ring-${
                  rarity === 'legendary'
                    ? 'yellow'
                    : rarity === 'epic'
                    ? 'purple'
                    : rarity === 'rare'
                    ? 'blue'
                    : rarity === 'uncommon'
                    ? 'green'
                    : 'gray'
                }-400`
              : ''
          }
        `}
      >
        {/* Rarity gradient overlay */}
        {earned && (
          <div
            className={`
              absolute inset-0 rounded-xl bg-gradient-to-br ${rarityGradients[rarity]} 
              opacity-10 pointer-events-none
            `}
          />
        )}

        {/* Icon */}
        <div className='relative z-10 flex items-center justify-center mb-3'>
          <div
            className={`
              p-3 rounded-full transition-all duration-300
              ${earned ? 'bg-white shadow-md' : 'bg-gray-100'}
            `}
          >
            <IconComponent
              className={`
                h-8 w-8 transition-colors duration-300
                ${earned ? 'text-gray-700' : 'text-gray-400'}
              `}
            />
          </div>
        </div>

        {/* Badge name */}
        <h3
          className={`
            text-sm font-semibold text-center mb-2 transition-colors duration-300
            ${earned ? 'text-gray-900' : 'text-gray-500'}
          `}
        >
          {name}
        </h3>

        {/* Description */}
        <p
          className={`
            text-xs text-center mb-3 transition-colors duration-300
            ${earned ? 'text-gray-600' : 'text-gray-400'}
          `}
        >
          {description}
        </p>

        {/* Progress bar */}
        {!earned && maxProgress > 1 && (
          <div className='mb-2'>
            <div className='flex justify-between text-xs text-gray-500 mb-1'>
              <span>Progresso</span>
              <span>
                {progress}/{maxProgress}
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className={`bg-gradient-to-r ${rarityGradients[rarity]} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Earned date */}
        {earned && earnedAt && (
          <p className='text-xs text-center text-gray-500'>
            Conquistado em {new Date(earnedAt).toLocaleDateString('pt-BR')}
          </p>
        )}

        {/* Rarity indicator */}
        <div className='absolute top-2 right-2'>
          <div
            className={`
              w-2 h-2 rounded-full
              ${
                rarity === 'legendary'
                  ? 'bg-yellow-400'
                  : rarity === 'epic'
                  ? 'bg-purple-400'
                  : rarity === 'rare'
                  ? 'bg-blue-400'
                  : rarity === 'uncommon'
                  ? 'bg-green-400'
                  : 'bg-gray-400'
              }
            `}
          />
        </div>

        {/* Hover effect */}
        <div
          className={`
            absolute inset-0 rounded-xl transition-opacity duration-300
            bg-gradient-to-br ${rarityGradients[rarity]} opacity-0 group-hover:opacity-5
            pointer-events-none
          `}
        />
      </div>
    </div>
  )
}

interface BadgeGridProps {
  badges: BadgeDisplayProps[]
  title?: string
  className?: string
}

export function BadgeGrid({ badges, title, className = '' }: BadgeGridProps) {
  const earnedBadges = badges.filter(badge => badge.earned)
  const unearnedBadges = badges.filter(badge => !badge.earned)

  return (
    <div className={className}>
      {title && (
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>{title}</h2>
          <p className='text-gray-600'>
            {earnedBadges.length} de {badges.length} badges conquistados
          </p>
        </div>
      )}

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div className='mb-8'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <TrophyIcon className='h-5 w-5 mr-2 text-yellow-500' />
            Conquistados ({earnedBadges.length})
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {earnedBadges.map((badge, index) => (
              <BadgeDisplay key={`earned-${index}`} {...badge} />
            ))}
          </div>
        </div>
      )}

      {/* Unearned badges */}
      {unearnedBadges.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <StarIcon className='h-5 w-5 mr-2 text-gray-400' />
            Em Progresso ({unearnedBadges.length})
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {unearnedBadges.map((badge, index) => (
              <BadgeDisplay key={`unearned-${index}`} {...badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
