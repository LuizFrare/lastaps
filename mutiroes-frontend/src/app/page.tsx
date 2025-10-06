'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding'
import { useNearbyEvents } from '@/hooks/useNearbyEvents'
import { api } from '@/lib/api'

interface Event {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  address: string
  city: string
  state: string
  latitude?: number
  longitude?: number
  category: {
    id: number
    name: string
  }
  organizer: {
    id: number
    username: string
    first_name: string
    last_name: string
  }
  participants_count: number
  max_participants: number
  status: string
  is_public: boolean
  image?: string
}

export default function HomePage() {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)

  const {
    latitude,
    longitude,
    getCurrentPosition,
    isLoading: isGeolocationLoading,
    error: geolocationError,
  } = useGeolocation({
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 300000,
  })

  const locationInfo = useReverseGeocoding(latitude, longitude)

  const {
    events: nearbyEvents,
    isLoading: isNearbyLoading,
    error: nearbyError,
  } = useNearbyEvents({
    latitude,
    longitude,
    radius: 10,
    enabled: !!latitude && !!longitude,
  })

  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true)
        setEventsError(null)
        const response = await api.getEvents({ limit: 6 })
        setAllEvents(
          (response.data as { results?: Event[] }).results ||
            (response.data as Event[])
        )
      } catch (error: unknown) {
        console.error('Error fetching events:', error)
        setEventsError(
          error instanceof Error ? error.message : 'Erro ao carregar eventos'
        )
        setAllEvents([])
      } finally {
        setIsLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [])

  // Get current location on component mount
  useEffect(() => {
    getCurrentPosition()
  }, [getCurrentPosition]) // Include getCurrentPosition in dependencies

  const handleLocationPermission = () => {
    getCurrentPosition()
  }

  const displayEvents = nearbyEvents.length > 0 ? nearbyEvents : allEvents
  const isLoading = isNearbyLoading || isLoadingEvents

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden'>
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5"></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              Faça a diferença no
              <span className='text-blue-600'> meio ambiente</span>
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
              Conecte-se com pessoas que compartilham sua paixão por um mundo
              mais sustentável. Participe de mutirões, ações comunitárias e crie
              um impacto real na sua região.
            </p>

            {/* Location Status */}
            {geolocationError && (
              <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-lg mx-auto'>
                <div className='flex items-start space-x-3'>
                  <MapPinIcon className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
                  <div className='flex-1'>
                    <h3 className='text-sm font-medium text-red-800 mb-1'>
                      Erro de Localização
                    </h3>
                    <p className='text-sm text-red-700 mb-3'>
                      {geolocationError}
                    </p>
                    {geolocationError?.includes('GPS indisponível') && (
                      <div className='text-xs text-red-600 mb-3 bg-red-100 p-3 rounded'>
                        <strong>Como ativar o GPS:</strong>
                        <ul className='mt-1 space-y-1 text-left'>
                          <li>
                            • <strong>Android:</strong> Configurações →
                            Localização → Ativar
                          </li>
                          <li>
                            • <strong>iPhone:</strong> Configurações →
                            Privacidade → Serviços de Localização
                          </li>
                          <li>
                            • <strong>Chrome:</strong> Configurações →
                            Privacidade → Localização
                          </li>
                        </ul>
                      </div>
                    )}
                    <div className='flex flex-col sm:flex-row gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleLocationPermission}
                        className='text-red-700 border-red-300 hover:bg-red-100'
                      >
                        {geolocationError.includes('negada')
                          ? 'Ativar Localização'
                          : 'Tentar Novamente'}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => window.location.reload()}
                        className='text-red-600 hover:bg-red-100'
                      >
                        Recarregar Página
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isGeolocationLoading && (
              <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto'>
                <div className='flex items-center justify-center space-x-2 text-blue-800'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                  <span className='text-sm'>Obtendo sua localização...</span>
                </div>
              </div>
            )}

            {latitude && longitude && (
              <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg max-w-lg mx-auto'>
                <div className='flex items-center justify-center space-x-2 text-green-800'>
                  <MapPinIcon className='h-5 w-5' />
                  <div className='text-center'>
                    <span className='text-sm font-medium'>
                      Localização detectada!
                    </span>
                    {locationInfo.city && (
                      <div className='text-sm text-green-700 mt-1'>
                        {locationInfo.city}
                        {locationInfo.state && `, ${locationInfo.state}`}
                        {locationInfo.country && ` - ${locationInfo.country}`}
                      </div>
                    )}
                    {locationInfo.isLoading && (
                      <span className='block text-xs text-green-600 mt-1'>
                        Obtendo informações da cidade...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/eventos'>
                <Button size='lg' className='text-lg px-8 py-4'>
                  Explorar Eventos
                  <ArrowRightIcon className='ml-2 h-5 w-5' />
                </Button>
              </Link>
              <Link href='/eventos/criar'>
                <Button
                  variant='outline'
                  size='lg'
                  className='text-lg px-8 py-4'
                >
                  Criar Evento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='text-3xl md:text-4xl font-bold text-blue-600 mb-2'>
                1,200+
              </div>
              <div className='text-gray-600 font-medium'>
                Eventos Realizados
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl md:text-4xl font-bold text-blue-600 mb-2'>
                15,000+
              </div>
              <div className='text-gray-600 font-medium'>
                Voluntários Ativos
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl md:text-4xl font-bold text-blue-600 mb-2'>
                500+
              </div>
              <div className='text-gray-600 font-medium'>
                Toneladas de Lixo Coletadas
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl md:text-4xl font-bold text-blue-600 mb-2'>
                2,000+
              </div>
              <div className='text-gray-600 font-medium'>Árvores Plantadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Por que escolher a Mutirões?
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Nossa plataforma foi criada para facilitar a organização e
              participação em ações ambientais
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <div className='p-6'>
                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <MapPinIcon className='h-6 w-6 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>Eventos Próximos</h3>
                <p className='text-gray-600'>
                  Encontre mutirões e ações ambientais na sua região
                </p>
              </div>
            </Card>

            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <div className='p-6'>
                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <UsersIcon className='h-6 w-6 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>Comunidade Ativa</h3>
                <p className='text-gray-600'>
                  Conecte-se com pessoas que compartilham seus valores
                </p>
              </div>
            </Card>

            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <div className='p-6'>
                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <HeartIcon className='h-6 w-6 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>Impacto Real</h3>
                <p className='text-gray-600'>
                  Veja o resultado das suas ações no meio ambiente
                </p>
              </div>
            </Card>

            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <div className='p-6'>
                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <SparklesIcon className='h-6 w-6 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold mb-2'>Gamificação</h3>
                <p className='text-gray-600'>
                  Conquiste badges e reconhecimento pelas suas contribuições
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center mb-12'>
            <div>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
                {nearbyEvents.length > 0
                  ? 'Eventos Próximos'
                  : 'Eventos Recentes'}
              </h2>
              <p className='text-xl text-gray-600'>
                {nearbyEvents.length > 0
                  ? 'Veja as ações ambientais na sua região'
                  : 'Veja as últimas ações ambientais organizadas pela comunidade'}
              </p>
            </div>
            <Link href='/eventos'>
              <Button variant='outline'>
                Ver Todos
                <ArrowRightIcon className='ml-2 h-4 w-4' />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {[...Array(3)].map((_, i) => (
                <Card key={i} className='overflow-hidden'>
                  <div className='h-48 bg-gray-200 animate-pulse' />
                  <div className='p-6'>
                    <div className='h-4 bg-gray-200 rounded animate-pulse mb-2' />
                    <div className='h-3 bg-gray-200 rounded animate-pulse mb-4' />
                    <div className='h-8 bg-gray-200 rounded animate-pulse' />
                  </div>
                </Card>
              ))}
            </div>
          ) : eventsError || nearbyError ? (
            <div className='text-center py-12'>
              <div className='text-red-600 mb-4'>
                {eventsError || nearbyError}
              </div>
              <Button onClick={() => window.location.reload()}>
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {displayEvents.slice(0, 3).map(event => (
                <Card
                  key={event.id}
                  className='overflow-hidden hover:shadow-lg transition-shadow duration-300'
                >
                  <div className='h-48 bg-gradient-to-br from-blue-400 to-green-400 relative'>
                    <Badge className='absolute top-4 left-4'>
                      {event.category?.name || 'Evento'}
                    </Badge>
                    <div className='absolute bottom-4 right-4 text-white'>
                      <div className='flex items-center space-x-1'>
                        <UsersIcon className='h-4 w-4' />
                        <span className='text-sm font-medium'>
                          {event.participants_count || 0}/
                          {event.max_participants || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='p-6'>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      {event.title}
                    </h3>
                    <div className='space-y-2 text-gray-600'>
                      <div className='flex items-center'>
                        <CalendarIcon className='h-4 w-4 mr-2' />
                        <span className='text-sm'>
                          {new Date(event.start_date).toLocaleDateString(
                            'pt-BR'
                          )}{' '}
                          às{' '}
                          {event.start_date?.split('T')[1]?.substring(0, 5) ||
                            '08:00'}
                        </span>
                      </div>
                      <div className='flex items-center'>
                        <MapPinIcon className='h-4 w-4 mr-2' />
                        <span className='text-sm'>
                          {event.city}, {event.state}
                        </span>
                      </div>
                    </div>
                    <div className='mt-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm text-gray-600'>
                          Participantes
                        </span>
                        <span className='text-sm font-medium'>
                          {event.participants_count || 0}/
                          {event.max_participants || 0}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                          style={{
                            width: `${Math.min(
                              100,
                              ((event.participants_count || 0) /
                                (event.max_participants || 1)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <Link href={`/eventos/${event.id}`}>
                      <Button className='w-full mt-4'>Participar</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-blue-600'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
            Pronto para fazer a diferença?
          </h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Junte-se à nossa comunidade e comece a participar de ações
            ambientais hoje mesmo
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/cadastro'>
              <Button
                variant='secondary'
                size='lg'
                className='text-lg px-8 py-4'
              >
                Criar Conta Grátis
              </Button>
            </Link>
            <Link href='/sobre'>
              <Button
                variant='outline'
                size='lg'
                className='text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600'
              >
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
