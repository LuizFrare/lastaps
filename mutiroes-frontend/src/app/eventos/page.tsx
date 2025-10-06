'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  HeartIcon,
  ShareIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { formatDate, formatTime, formatRelativeTime } from '@/lib/utils'
import { api } from '@/lib/api'
import { useGeolocation } from '@/hooks/useGeolocation'

export default function EventosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('distance')
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { latitude, longitude } = useGeolocation()

  const categories = [
    { id: 'all', name: 'Todos', count: 24 },
    { id: 'limpeza', name: 'Limpeza', count: 12 },
    { id: 'plantio', name: 'Plantio', count: 8 },
    { id: 'monitoramento', name: 'Monitoramento', count: 4 },
  ]

  // Função para calcular distância usando fórmula de Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Load events on component mount
  const fetchEvents = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🔄 Carregando eventos...')
      const response = await api.getEvents()
      console.log('📦 Resposta da API:', response)
      const eventsData = (response.data as { results?: any[] }).results ||
        (response.data as any[])
      console.log('✅ Eventos carregados:', eventsData.length)
      setEvents(eventsData)
    } catch (error: any) {
      console.error('❌ Error fetching events:', error)
      setError(error.message || 'Erro ao carregar eventos')
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Recarregar eventos quando a página recebe foco
  React.useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Página recebeu foco, recarregando eventos...')
      fetchEvents()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchEvents])

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' ||
      event.category.name.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        // Se não houver geolocalização, ordenar por data
        if (!latitude || !longitude) {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        }
        // Verificar se os eventos têm coordenadas válidas
        const hasACoords = a.latitude && a.longitude
        const hasBCoords = b.latitude && b.longitude
        
        // Se nenhum tem coordenadas, ordenar por data
        if (!hasACoords && !hasBCoords) {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        }
        // Se apenas A tem coordenadas, A vem primeiro
        if (hasACoords && !hasBCoords) return -1
        // Se apenas B tem coordenadas, B vem primeiro
        if (!hasACoords && hasBCoords) return 1
        
        // Ambos têm coordenadas, calcular distância
        const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude)
        const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude)
        return distA - distB
      case 'date':
        return (
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        )
      case 'participants':
        return b.participants_count - a.participants_count
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Eventos Ambientais
          </h1>
          <p className='text-xl text-gray-600'>
            Encontre e participe de mutirões e ações comunitárias na sua região
          </p>
        </div>

        {/* Filters and Search */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <Input
                  placeholder='Buscar eventos, organizações, localizações...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className='flex gap-2 overflow-x-auto'>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto'
              >
                <option value='distance'>Distância</option>
                <option value='date'>Data</option>
                <option value='participants'>Participantes</option>
                <option value='title'>Nome</option>
              </select>
              {sortBy === 'distance' && latitude && longitude && (
                <div className='flex items-center gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 whitespace-nowrap w-full sm:w-auto justify-center'>
                  <InformationCircleIcon className='h-5 w-5 flex-shrink-0' />
                  <span className='font-medium'>Mais próximos primeiro</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {sortedEvents.map(event => (
            <Card
              key={event.id}
              className='overflow-hidden hover:shadow-lg transition-shadow duration-300'
            >
              {/* Event Image */}
              <div className='h-48 bg-gradient-to-br from-blue-400 to-green-400 relative'>
                <Badge variant='primary' className='absolute top-4 left-4'>
                  {event.category?.name || 'Geral'}
                </Badge>
                <div className='absolute top-4 right-4 flex space-x-2'>
                  <button className='p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors duration-200'>
                    <HeartIcon className='h-4 w-4 text-white' />
                  </button>
                  <button className='p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors duration-200'>
                    <ShareIcon className='h-4 w-4 text-white' />
                  </button>
                </div>
                <div className='absolute bottom-4 right-4 text-white'>
                  <div className='flex items-center space-x-1'>
                    <UsersIcon className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      {event.participants}/{event.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className='p-6'>
                {/* Event Title and Description */}
                <h3 className='text-xl font-semibold text-gray-900 mb-2 line-clamp-2'>
                  {event.title}
                </h3>
                <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                  {event.description}
                </p>

                {/* Event Details */}
                <div className='space-y-3 mb-4'>
                  <div className='flex items-center text-gray-600'>
                    <CalendarIcon className='h-4 w-4 mr-2 flex-shrink-0' />
                    <span className='text-sm'>
                      {formatDate(event.start_date)} às{' '}
                      {formatTime(event.start_date)}
                    </span>
                  </div>
                  <div className='flex items-center text-gray-600'>
                    <MapPinIcon className='h-4 w-4 mr-2 flex-shrink-0' />
                    <span className='text-sm truncate'>{event.address}</span>
                  </div>
                  <div className='flex items-center text-gray-600'>
                    <UsersIcon className='h-4 w-4 mr-2 flex-shrink-0' />
                    <span className='text-sm'>
                      Organizado por{' '}
                      {event.organizer_name ||
                        event.organizer?.first_name +
                          ' ' +
                          event.organizer?.last_name ||
                        'Usuário'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Participantes</span>
                    <span className='text-sm font-medium'>
                      {event.participants_count}/{event.max_participants}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${
                          (event.participants_count / event.max_participants) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex space-x-2'>
                  <Link href={`/eventos/${event.id}`} className='flex-1'>
                    <Button className='w-full'>Participar</Button>
                  </Link>
                  <Button variant='outline' size='icon'>
                    <HeartIcon className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {sortedEvents.length > 0 && (
          <div className='text-center mt-12'>
            <Button variant='outline' size='lg'>
              Carregar Mais Eventos
            </Button>
          </div>
        )}

        {/* Empty State */}
        {sortedEvents.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <MagnifyingGlassIcon className='h-12 w-12 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Nenhum evento encontrado
            </h3>
            <p className='text-gray-600 mb-6'>
              Tente ajustar os filtros ou buscar por outros termos
            </p>
            <Button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
