'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import {
  ClockIcon,
  UserGroupIcon,
  TrashIcon,
  BeakerIcon,
  MapIcon,
} from '@heroicons/react/24/outline'

interface EventReportProps {
  eventId: number
  isOrganizer: boolean
}

interface ReportData {
  id?: number
  total_participants?: number
  total_hours?: number
  trash_collected_kg?: number
  trees_planted?: number
  area_cleaned_m2?: number
  recyclable_material_kg?: number
  summary?: string
  challenges?: string
  achievements?: string
  created_by_name?: string
  created_at?: string
}

export function EventReport({ eventId, isOrganizer }: EventReportProps) {
  const [report, setReport] = useState<ReportData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<ReportData>({})

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.getEventReport(eventId)
      setReport(response.data as ReportData)
      setFormData(response.data as ReportData)
    } catch (error) {
      // Se não encontrar o relatório (404), não é um erro
      console.error('Erro ao buscar relatório:', error)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (report?.id) {
        // Atualizar relatório existente
        await api.updateEventReport(eventId, formData)
      } else {
        // Criar novo relatório
        await api.createEventReport(eventId, formData)
      }

      await fetchReport()
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao salvar relatório:', error)
      alert('Erro ao salvar relatório. Tente novamente.')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-8'>
          <div className='text-center text-gray-500'>
            Carregando relatório...
          </div>
        </CardContent>
      </Card>
    )
  }

  // Exibir visualização do relatório
  if (report && !isEditing) {
    return (
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Relatório do Evento</CardTitle>
          {isOrganizer && (
            <Button onClick={() => setIsEditing(true)} variant='outline'>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Estatísticas em Grid */}
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {report.total_participants !== undefined && (
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-center space-x-2 mb-2'>
                  <UserGroupIcon className='h-5 w-5 text-blue-600' />
                  <span className='text-sm text-gray-600'>Participantes</span>
                </div>
                <p className='text-2xl font-bold text-blue-600'>
                  {report.total_participants}
                </p>
              </div>
            )}

            {report.total_hours !== undefined && (
              <div className='bg-green-50 p-4 rounded-lg'>
                <div className='flex items-center space-x-2 mb-2'>
                  <ClockIcon className='h-5 w-5 text-green-600' />
                  <span className='text-sm text-gray-600'>Horas Totais</span>
                </div>
                <p className='text-2xl font-bold text-green-600'>
                  {report.total_hours}h
                </p>
              </div>
            )}

            {report.trash_collected_kg !== undefined && (
              <div className='bg-orange-50 p-4 rounded-lg'>
                <div className='flex items-center space-x-2 mb-2'>
                  <TrashIcon className='h-5 w-5 text-orange-600' />
                  <span className='text-sm text-gray-600'>Lixo Coletado</span>
                </div>
                <p className='text-2xl font-bold text-orange-600'>
                  {report.trash_collected_kg} kg
                </p>
              </div>
            )}

            {report.trees_planted !== undefined && (
              <div className='bg-emerald-50 p-4 rounded-lg'>
                <div className='flex items-center space-x-2 mb-2'>
                  <span className='text-xl'>🌳</span>
                  <span className='text-sm text-gray-600'>
                    Árvores Plantadas
                  </span>
                </div>
                <p className='text-2xl font-bold text-emerald-600'>
                  {report.trees_planted}
                </p>
              </div>
            )}

            {report.area_cleaned_m2 !== undefined && (
              <div className='bg-cyan-50 p-4 rounded-lg'>
                <div className='flex items-center space-x-2 mb-2'>
                  <MapIcon className='h-5 w-5 text-cyan-600' />
                  <span className='text-sm text-gray-600'>Área Limpa</span>
                </div>
                <p className='text-2xl font-bold text-cyan-600'>
                  {report.area_cleaned_m2} m²
                </p>
              </div>
            )}

            {report.recyclable_material_kg !== undefined && (
              <div className='bg-purple-50 p-4 rounded-lg'>
                <div className='flex items-center space-x-2 mb-2'>
                  <BeakerIcon className='h-5 w-5 text-purple-600' />
                  <span className='text-sm text-gray-600'>Reciclável</span>
                </div>
                <p className='text-2xl font-bold text-purple-600'>
                  {report.recyclable_material_kg} kg
                </p>
              </div>
            )}
          </div>

          {/* Textos descritivos */}
          {report.summary && (
            <div>
              <h3 className='font-semibold text-gray-900 mb-2'>Resumo</h3>
              <p className='text-gray-700'>{report.summary}</p>
            </div>
          )}

          {report.achievements && (
            <div>
              <h3 className='font-semibold text-gray-900 mb-2'>
                Conquistas
              </h3>
              <p className='text-gray-700'>{report.achievements}</p>
            </div>
          )}

          {report.challenges && (
            <div>
              <h3 className='font-semibold text-gray-900 mb-2'>Desafios</h3>
              <p className='text-gray-700'>{report.challenges}</p>
            </div>
          )}

          {report.created_by_name && (
            <div className='text-sm text-gray-500 pt-4 border-t'>
              Relatório criado por {report.created_by_name}
              {report.created_at &&
                ` em ${new Date(report.created_at).toLocaleDateString('pt-BR')}`}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Exibir formulário se for organizador e estiver editando ou não existir relatório
  if (isOrganizer && (isEditing || !report)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {report ? 'Editar Relatório' : 'Criar Relatório do Evento'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Total de Participantes
                </label>
                <input
                  type='number'
                  name='total_participants'
                  value={formData.total_participants || ''}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  min='0'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Total de Horas
                </label>
                <input
                  type='number'
                  name='total_hours'
                  value={formData.total_hours || ''}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  min='0'
                  step='0.5'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Lixo Coletado (kg)
                </label>
                <input
                  type='number'
                  name='trash_collected_kg'
                  value={formData.trash_collected_kg || ''}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  min='0'
                  step='0.1'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Árvores Plantadas
                </label>
                <input
                  type='number'
                  name='trees_planted'
                  value={formData.trees_planted || ''}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  min='0'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Área Limpa (m²)
                </label>
                <input
                  type='number'
                  name='area_cleaned_m2'
                  value={formData.area_cleaned_m2 || ''}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  min='0'
                  step='0.1'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Material Reciclável (kg)
                </label>
                <input
                  type='number'
                  name='recyclable_material_kg'
                  value={formData.recyclable_material_kg || ''}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                  min='0'
                  step='0.1'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Resumo
              </label>
              <textarea
                name='summary'
                value={formData.summary || ''}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                placeholder='Descreva brevemente como foi o evento...'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Conquistas
              </label>
              <textarea
                name='achievements'
                value={formData.achievements || ''}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                placeholder='Quais foram as principais conquistas?'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Desafios
              </label>
              <textarea
                name='challenges'
                value={formData.challenges || ''}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
                placeholder='Quais desafios foram enfrentados?'
              />
            </div>

            <div className='flex space-x-2'>
              <Button type='submit' className='flex-1'>
                {report ? 'Atualizar Relatório' : 'Criar Relatório'}
              </Button>
              {isEditing && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Se não for organizador e não existir relatório, não mostrar nada
  return null
}
