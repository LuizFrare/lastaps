'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  ShareIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { api } from '@/lib/api'
import { EventReport } from '@/components/EventReport'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)

  const {
    latitude,
    longitude,
    getCurrentPosition,
    isLoading: isGeolocationLoading,
  } = useGeolocation()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const response = await api.getEvent(Number(params.id))
        setEvent(response.data)
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + window.location.pathname)
      return
    }

    try {
      setIsJoining(true)
      await api.joinEvent(event.id)

      // Update UI - refetch event to get updated data
      const response = await api.getEvent(Number(params.id))
      setEvent(response.data)
    } catch (error) {
      console.error('Error joining event:', error)
      alert('Erro ao participar do evento. Tente novamente.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      await api.checkInEvent(event.id)
      setIsCheckedIn(true)
      alert('Check-in realizado com sucesso!')
    } catch (error) {
      console.error('Error checking in:', error)
      alert(
        'Erro ao fazer check-in. Verifique se você está no local do evento.'
      )
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Confira este evento: ${event.title}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copiar para área de transferência
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copiado para a área de transferência!')
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDistance = () => {
    if (!latitude || !longitude || !event?.latitude || !event?.longitude) {
      return null
    }

    // Simple distance calculation (not accurate for long distances)
    const R = 6371 // Earth's radius in km
    const dLat = ((event.latitude - latitude) * Math.PI) / 180
    const dLon = ((event.longitude - longitude) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((latitude * Math.PI) / 180) *
        Math.cos((event.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/2 mb-4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/4 mb-8'></div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2 space-y-6'>
                <div className='h-64 bg-gray-200 rounded'></div>
                <div className='h-32 bg-gray-200 rounded'></div>
              </div>
              <div className='space-y-6'>
                <div className='h-32 bg-gray-200 rounded'></div>
                <div className='h-24 bg-gray-200 rounded'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <Card className='text-center p-8'>
            <CardTitle className='text-2xl font-bold mb-4'>
              Evento não encontrado
            </CardTitle>
            <p className='text-gray-600 mb-6'>
              O evento que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => router.push('/eventos')}>
              Ver Todos os Eventos
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const distance = getDistance()
  const isEventToday =
    new Date(event.start_date).toDateString() === new Date().toDateString()
  const isEventPast = new Date(event.start_date) < new Date()

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='text-gray-600'
            >
              ← Voltar
            </Button>
            <div className='flex space-x-2'>
              <Button variant='outline' size='sm' onClick={handleShare}>
                <ShareIcon className='h-4 w-4 mr-2' />
                Compartilhar
              </Button>
            </div>
          </div>

          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {event.title}
              </h1>
              <div className='flex items-center space-x-4 text-gray-600'>
                <div className='flex items-center'>
                  <MapPinIcon className='h-4 w-4 mr-1' />
                  {event.address}
                  {distance && (
                    <span className='ml-2 text-sm text-blue-600'>
                      ({distance} de distância)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge variant='primary' className='text-sm'>
              {event.category.name}
            </Badge>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-700 leading-relaxed'>
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Evento</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center'>
                  <CalendarIcon className='h-5 w-5 text-gray-400 mr-3' />
                  <div>
                    <p className='font-medium'>
                      {formatDate(event.start_date)}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {formatTime(event.start_date)} -{' '}
                      {formatTime(event.end_date)}
                    </p>
                  </div>
                </div>

                <div className='flex items-center'>
                  <MapPinIcon className='h-5 w-5 text-gray-400 mr-3' />
                  <div>
                    <p className='font-medium'>{event.address}</p>
                    <p className='text-sm text-gray-600'>
                      {event.city}, {event.state}
                    </p>
                  </div>
                </div>

                <div className='flex items-center'>
                  <UsersIcon className='h-5 w-5 text-gray-400 mr-3' />
                  <div>
                    <p className='font-medium'>
                      {event.participants_count} de {event.max_participants}{' '}
                      participantes
                    </p>
                    <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
                      <div
                        className='bg-blue-500 h-2 rounded-full'
                        style={{
                          width: `${
                            (event.participants_count /
                              event.max_participants) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Organizador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center space-x-3'>
                  {event.organizer_avatar ? (
                    <img
                      src={event.organizer_avatar}
                      alt={event.organizer_name}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-medium text-gray-600'>
                        {event.organizer_name?.[0]?.toUpperCase() || 'O'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className='font-medium'>{event.organizer_name}</p>
                    <p className='text-sm text-gray-600'>Organizador</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Report - Mostrar apenas após o evento */}
            {isEventPast && (
              <EventReport
                eventId={event.id}
                isOrganizer={user?.username === event.organizer}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Action Buttons */}
            <Card>
              <CardContent className='p-6'>
                {isEventPast ? (
                  <div className='text-center'>
                    <XCircleIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-600 mb-4'>
                      Este evento já aconteceu
                    </p>
                  </div>
                ) : event.participants_count >= event.max_participants ? (
                  <div className='text-center'>
                    <XCircleIcon className='h-12 w-12 text-red-400 mx-auto mb-4' />
                    <p className='text-gray-600 mb-4'>Evento lotado</p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <Button
                      onClick={handleJoinEvent}
                      disabled={isJoining || event.user_participating}
                      className='w-full'
                    >
                      {isJoining
                        ? 'Inscrevendo...'
                        : event.user_participating
                        ? 'Inscrito'
                        : 'Participar do Evento'}
                    </Button>

                    {event.user_participating &&
                      isEventToday &&
                      !isCheckedIn && (
                        <Button
                          onClick={handleCheckIn}
                          variant='outline'
                          className='w-full'
                        >
                          <CheckCircleIcon className='h-4 w-4 mr-2' />
                          Fazer Check-in
                        </Button>
                      )}

                    {isCheckedIn && (
                      <div className='text-center text-green-600'>
                        <CheckCircleIcon className='h-8 w-8 mx-auto mb-2' />
                        <p className='text-sm font-medium'>
                          Check-in realizado!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Informações</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Vagas disponíveis:</span>
                  <span className='font-medium'>
                    {event.max_participants - event.participants_count}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Aprovação:</span>
                  <span className='font-medium'>
                    {event.requires_approval ? 'Necessária' : 'Não necessária'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Visibilidade:</span>
                  <span className='font-medium'>
                    {event.is_public ? 'Público' : 'Privado'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={handleShare}
                >
                  <ShareIcon className='h-4 w-4 mr-2' />
                  Compartilhar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
