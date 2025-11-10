'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import Link from 'next/link'
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoadingEvents(true)
        const response = await api.getMyEvents()
        const organized = (response.data as any)?.organized || []
        const participating = (response.data as any)?.participating || []
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

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center space-x-6'>
            <div className='h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center'>
              <span className='text-2xl font-semibold text-blue-600'>
                {user.first_name.charAt(0)}
                {user.last_name.charAt(0)}
              </span>
            </div>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold text-gray-900'>
                {user.first_name} {user.last_name}
              </h1>
              <p className='text-gray-600'>{user.email}</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Eventos</CardTitle>
              <UserGroupIcon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{myEvents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Horas</CardTitle>
              <ClockIcon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{myEvents.length * 4}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Próximos</CardTitle>
              <CalendarIcon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {
                  myEvents.filter(e => new Date(e.start_date) > new Date())
                    .length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meus Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <p className='text-center py-8 text-gray-500'>Carregando...</p>
            ) : myEvents.length > 0 ? (
              <div className='space-y-4'>
                {myEvents.map((event: any) => (
                  <Link key={event.id} href={`/eventos/${event.id}`}>
                    <div className='border rounded-lg p-4 hover:shadow-md'>
                      <h3 className='font-semibold'>{event.title}</h3>
                      <p className='text-sm text-gray-600 mt-1'>
                        {event.description}
                      </p>
                      <div className='flex gap-4 text-xs text-gray-500 mt-2'>
                        <span>
                          {new Date(event.start_date).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                        <span>
                          {event.city}, {event.state}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <p className='text-gray-500 mb-4'>Nenhum evento ainda</p>
                <Button onClick={() => (window.location.href = '/eventos')}>
                  Explorar Eventos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
