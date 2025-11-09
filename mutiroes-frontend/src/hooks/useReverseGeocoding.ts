'use client'

import { useState, useEffect } from 'react'

interface LocationInfo {
  city: string | null
  state: string | null
  country: string | null
  isLoading: boolean
  error: string | null
}

export function useReverseGeocoding(
  latitude: number | null,
  longitude: number | null
) {
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    city: null,
    state: null,
    country: null,
    isLoading: false,
    error: null,
  })

  useEffect(() => {
    if (!latitude || !longitude) {
      setLocationInfo({
        city: null,
        state: null,
        country: null,
        isLoading: false,
        error: null,
      })
      return
    }

    const getLocationInfo = async () => {
      setLocationInfo(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        // Usar o serviço de geocoding reverso do OpenStreetMap (Nominatim)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR,pt,en`
        )

        if (!response.ok) {
          throw new Error('Erro ao obter informações de localização')
        }

        const data = await response.json()

        if (data && data.address) {
          setLocationInfo({
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.municipality ||
              null,
            state: data.address.state || data.address.region || null,
            country: data.address.country || null,
            isLoading: false,
            error: null,
          })
        } else {
          throw new Error('Informações de localização não encontradas')
        }
      } catch (error: any) {
        console.warn('Reverse geocoding failed:', error)
        setLocationInfo(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Erro ao obter informações de localização',
        }))
      }
    }

    getLocationInfo()
  }, [latitude, longitude])

  return locationInfo
}


