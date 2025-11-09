'use client'

import { useState, useEffect } from 'react'
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

interface UseNearbyEventsOptions {
  latitude?: number | null
  longitude?: number | null
  radius?: number
  enabled?: boolean
}

export function useNearbyEvents({
  latitude,
  longitude,
  radius = 10,
  enabled = true,
}: UseNearbyEventsOptions) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !latitude || !longitude) {
      return
    }

    const fetchNearbyEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await api.getNearbyEvents(latitude, longitude, radius)
        setEvents(response.data)
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar eventos próximos')
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNearbyEvents()
  }, [latitude, longitude, radius, enabled])

  const refetch = async () => {
    if (!enabled || !latitude || !longitude) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.getNearbyEvents(latitude, longitude, radius)
      setEvents(response.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar eventos próximos')
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    events,
    isLoading,
    error,
    refetch,
  }
}


