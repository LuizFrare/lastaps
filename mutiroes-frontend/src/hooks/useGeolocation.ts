'use client'

import { useState, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  isLoading: boolean
  source: 'gps' | 'ip' | null
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
    source: null,
  })

  const {
    enableHighAccuracy = false, // Start with false for better compatibility
    timeout = 15000, // Increased timeout
    maximumAge = 300000, // 5 minutes
  } = options

  const tryGeolocation = useCallback((options: GeolocationOptions) => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })
  }, [])

  const getLocationByIP = useCallback(async () => {
    try {
      console.log('Trying IP-based location as fallback...')
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.latitude && data.longitude) {
        console.log('IP-based location success:', data)
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 10000, // IP location is less accurate
          source: 'ip' as const
        }
      }
      throw new Error('No location data from IP service')
    } catch (error) {
      console.warn('IP-based location failed:', error)
      throw error
    }
  }, [])

  const getCurrentPosition = useCallback(async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalização não é suportada por este navegador',
        isLoading: false,
      }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Try with different configurations - more conservative approach
      const configs = [
        // First try: Fast, low accuracy (most likely to work)
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
        // Second try: Medium accuracy, longer timeout
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
        // Third try: High accuracy, longest timeout
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 },
        // Fourth try: No cache, fast timeout
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 },
      ]

      let lastError: GeolocationPositionError | null = null
      let success = false

      for (let i = 0; i < configs.length; i++) {
        const config = configs[i]
        try {
          console.log(
            `Trying geolocation attempt ${i + 1}/${
              configs.length
            } with config:`,
            config
          )

          const position = await tryGeolocation(config)
          console.log('Geolocation success:', position.coords)

          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: null,
            isLoading: false,
            source: 'gps',
          })
          success = true
          break
        } catch (error) {
          lastError = error as GeolocationPositionError
          console.warn(`Geolocation attempt ${i + 1} failed:`, error)

          // If it's a permission denied error, don't try other configs
          if (lastError.code === lastError.PERMISSION_DENIED) {
            break
          }

          // Add a small delay between attempts
          if (i < configs.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
      }

      // If all GPS attempts failed, try IP-based location as fallback
      if (!success && lastError) {
        // Only try IP fallback for POSITION_UNAVAILABLE or TIMEOUT errors
        if (lastError.code === lastError.POSITION_UNAVAILABLE || lastError.code === lastError.TIMEOUT) {
          try {
            console.log('GPS failed, trying IP-based location fallback...')
            const ipLocation = await getLocationByIP()
            
            setState({
              latitude: ipLocation.latitude,
              longitude: ipLocation.longitude,
              accuracy: ipLocation.accuracy,
              error: null,
              isLoading: false,
              source: 'ip',
            })
            return
          } catch (ipError) {
            console.warn('IP-based location also failed:', ipError)
          }
        }

        let errorMessage = 'Erro ao obter localização'

        switch (lastError.code) {
          case lastError.PERMISSION_DENIED:
            errorMessage =
              'Permissão de localização negada. Ative a localização nas configurações do navegador e recarregue a página.'
            break
          case lastError.POSITION_UNAVAILABLE:
            errorMessage =
              'GPS indisponível. Verifique se o GPS está ativado no seu dispositivo e tente novamente. Dica: Ative a localização de alta precisão nas configurações.'
            break
          case lastError.TIMEOUT:
            errorMessage =
              'Tempo limite excedido. Verifique sua conexão com a internet e tente novamente.'
            break
          default:
            errorMessage = `Erro de geolocalização: ${
              lastError.message || 'Erro desconhecido'
            }`
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }))
      }
    } catch (error) {
      console.error('Unexpected geolocation error:', error)
      setState(prev => ({
        ...prev,
        error:
          'Erro inesperado ao obter localização. Tente recarregar a página.',
        isLoading: false,
      }))
    }
  }, [tryGeolocation, getLocationByIP])

  const watchPosition = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalização não é suportada por este navegador',
        isLoading: false,
      }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const watchId = navigator.geolocation.watchPosition(
      position => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false,
          source: 'gps',
        })
      },
      error => {
        let errorMessage = 'Erro ao monitorar localização'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível'
            break
          case error.TIMEOUT:
            errorMessage = 'Tempo limite excedido'
            break
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }))
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )

    return watchId
  }

  const clearWatch = (watchId: number) => {
    navigator.geolocation.clearWatch(watchId)
  }

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  }
}
