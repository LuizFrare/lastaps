'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  PhotoIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding'
import { api } from '@/lib/api'

interface EventCategory {
  id: number
  name: string
  description?: string
}

interface PaginatedResponse<T> {
  results: T[]
  count?: number
  next?: string | null
  previous?: string | null
}

export default function CreateEventPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    registrationDeadlineDate: '',
    registrationDeadlineTime: '',
    maxParticipants: '',
    address: '',
    city: '',
    state: '',
    latitude: 0,
    longitude: 0,
    requiresApproval: false,
    isPublic: true,
  })

  const {
    latitude,
    longitude,
    getCurrentPosition,
    isLoading: isGeolocationLoading,
    error: geolocationError,
  } = useGeolocation()

  const locationInfo = useReverseGeocoding(latitude, longitude)

  // Load categories from API
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🔍 Iniciando carregamento de categorias...')
        const response = await api.getCategories()
        console.log('📦 Resposta recebida:', response)
        console.log('📊 response.data:', response.data)
        
        // A API retorna um objeto com 'results' contendo o array de categorias
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as PaginatedResponse<EventCategory>)?.results || []
        
        console.log('✅ Categorias processadas:', categoriesData)
        console.log('✅ Total de categorias:', categoriesData.length)
        setCategories(categoriesData)
        
        if (categoriesData.length === 0) {
          console.warn('⚠️ Nenhuma categoria encontrada')
        } else {
          console.log('✅ Categorias carregadas com sucesso!')
        }
      } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error)
        setCategories([]) // Garantir array vazio em caso de erro
      }
    }
    loadCategories()
  }, [])

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/eventos/criar')
    }
  }, [isAuthenticated, router])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Preparar dados do evento para a API
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: parseInt(formData.category), // Enviar como ID numérico
        start_date: `${formData.startDate}T${formData.startTime}:00`,
        end_date: `${formData.endDate}T${formData.endTime}:00`,
        registration_deadline: `${formData.registrationDeadlineDate}T${formData.registrationDeadlineTime}:00`,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        latitude: formData.latitude,
        longitude: formData.longitude,
        max_participants: parseInt(formData.maxParticipants) || 10,
        is_public: formData.isPublic,
        requires_approval: formData.requiresApproval,
      }

      // Adicionar status 'published' para que o evento apareça na listagem
      const eventDataWithStatus = {
        ...eventData,
        status: 'published'
      }
      
      console.log('📤 Enviando dados do evento:', eventDataWithStatus)
      const response = await api.createEvent(eventDataWithStatus)
      console.log('✅ Evento criado com sucesso:', response)
      
      // Redirecionar para a página do evento criado
      if (response.data && (response.data as any).id) {
        console.log('🔀 Redirecionando para o evento:', (response.data as any).id)
        // Usar router.push com força de refresh
        router.push(`/eventos/${(response.data as any).id}`)
        router.refresh()
      } else {
        console.log('🔀 Redirecionando para lista de eventos')
        router.push('/eventos')
        router.refresh()
      }
    } catch (error) {
      console.error('❌ Error creating event:', error)
      alert('Erro ao criar evento. Por favor, verifique os dados e tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <Card className='w-full max-w-md text-center p-8'>
          <CardTitle className='text-2xl font-bold mb-4'>
            Acesso Negado
          </CardTitle>
          <p className='text-gray-600 mb-6'>
            Você precisa estar logado para criar um evento.
          </p>
          <Button onClick={() => router.push('/login')}>Fazer Login</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Criar Novo Evento
          </h1>
          <p className='text-gray-600'>
            Organize um mutirão ou ação comunitária e conecte-se com voluntários
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <TagIcon className='h-5 w-5 mr-2' />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Título do Evento *
                </label>
                <Input
                  name='title'
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder='Ex: Limpeza da Praia de Copacabana'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Descrição *
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Descreva o evento, objetivos e o que os voluntários farão...'
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  rows={4}
                  required
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Categoria *
                  </label>
                  <select
                    name='category'
                    value={formData.category}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    required
                  >
                    {categories.length === 0 ? (
                      <option value=''>Carregando categorias...</option>
                    ) : (
                      <>
                        <option value=''>Selecione uma categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Máximo de Participantes
                  </label>
                  <Input
                    name='maxParticipants'
                    type='number'
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    placeholder='50'
                    min='1'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <CalendarIcon className='h-5 w-5 mr-2' />
                Data e Horário
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Data de Início *
                  </label>
                  <Input
                    name='startDate'
                    type='date'
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Horário de Início *
                  </label>
                  <Input
                    name='startTime'
                    type='time'
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Data de Término *
                  </label>
                  <Input
                    name='endDate'
                    type='date'
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Horário de Término *
                  </label>
                  <Input
                    name='endTime'
                    type='time'
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Prazo de Inscrição *
                  </label>
                  <Input
                    name='registrationDeadlineDate'
                    type='date'
                    value={formData.registrationDeadlineDate}
                    onChange={handleInputChange}
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Data limite para inscrições
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Horário Limite *
                  </label>
                  <Input
                    name='registrationDeadlineTime'
                    type='time'
                    value={formData.registrationDeadlineTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <MapPinIcon className='h-5 w-5 mr-2' />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {geolocationError && (
                <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                  <p className='text-sm text-yellow-800'>{geolocationError}</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={getCurrentPosition}
                    className='mt-2'
                  >
                    Tentar Novamente
                  </Button>
                </div>
              )}

              {locationInfo.city && (
                <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <p className='text-sm text-green-800'>
                    Localização detectada: {locationInfo.city}
                    {locationInfo.state && `, ${locationInfo.state}`}
                  </p>
                </div>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Endereço *
                </label>
                <Input
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder='Ex: Praia de Copacabana, Rio de Janeiro'
                  required
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Cidade *
                  </label>
                  <Input
                    name='city'
                    value={formData.city || locationInfo.city || ''}
                    onChange={handleInputChange}
                    placeholder='Rio de Janeiro'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Estado *
                  </label>
                  <Input
                    name='state'
                    value={formData.state || locationInfo.state || ''}
                    onChange={handleInputChange}
                    placeholder='RJ'
                    maxLength={2}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <ClockIcon className='h-5 w-5 mr-2' />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    name='requiresApproval'
                    checked={formData.requiresApproval}
                    onChange={handleInputChange}
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                  <label className='ml-2 text-sm text-gray-700'>
                    Requer aprovação para participação
                  </label>
                </div>

                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    name='isPublic'
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                  <label className='ml-2 text-sm text-gray-700'>
                    Evento público (visível para todos)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='min-w-[120px]'
            >
              {isSubmitting ? 'Criando...' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
