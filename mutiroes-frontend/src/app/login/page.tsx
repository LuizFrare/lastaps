'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar se o usuário acabou de se registrar
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Conta criada com sucesso! Faça login para continuar.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      router.push('/')
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <Link
            href='/'
            className='flex items-center justify-center space-x-2 mb-6'
          >
            <div className='w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-xl'>M</span>
            </div>
            <span className='text-2xl font-bold text-gray-900'>Mutirões</span>
          </Link>
          <h2 className='text-3xl font-bold text-gray-900'>
            Entre na sua conta
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Ou{' '}
            <Link
              href='/cadastro'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              crie uma conta gratuita
            </Link>
          </p>
        </div>

        <Card className='p-8'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {successMessage && (
              <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm'>
                {successMessage}
              </div>
            )}

            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Email
              </label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                value={formData.email}
                onChange={handleChange}
                placeholder='seu@email.com'
                className='w-full'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Senha
              </label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                value={formData.password}
                onChange={handleChange}
                placeholder='Sua senha'
                className='w-full'
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='remember-me'
                  type='checkbox'
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='remember-me'
                  className='ml-2 block text-sm text-gray-900'
                >
                  Lembrar de mim
                </label>
              </div>
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full'
              size='lg'
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
