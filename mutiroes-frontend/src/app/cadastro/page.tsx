'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      setIsLoading(false)
      return
    }

    // Check if password is too common or entirely numeric
    if (/^\d+$/.test(formData.password)) {
      setError('A senha não pode ser inteiramente numérica')
      setIsLoading(false)
      return
    }

    if (
      formData.password.toLowerCase() === 'password' ||
      formData.password.toLowerCase() === '12345678' ||
      formData.password.toLowerCase() === 'qwerty123'
    ) {
      setError('A senha é muito comum. Escolha uma senha mais segura')
      setIsLoading(false)
      return
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
      })
      // Redirecionar para o login após registro bem-sucedido
      router.push('/login?registered=true')
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta')
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
          <h2 className='text-3xl font-bold text-gray-900'>Crie sua conta</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Ou{' '}
            <Link
              href='/login'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              faça login na sua conta existente
            </Link>
          </p>
        </div>

        <Card className='p-8'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Nome
                </label>
                <Input
                  id='firstName'
                  name='firstName'
                  type='text'
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder='João'
                  className='w-full'
                />
              </div>

              <div>
                <label
                  htmlFor='lastName'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Sobrenome
                </label>
                <Input
                  id='lastName'
                  name='lastName'
                  type='text'
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder='Silva'
                  className='w-full'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Nome de usuário
              </label>
              <Input
                id='username'
                name='username'
                type='text'
                required
                value={formData.username}
                onChange={handleChange}
                placeholder='joao.silva'
                className='w-full'
              />
            </div>

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
                placeholder='seuemail@exemplo.com'
                className='w-full'
                pattern='[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
                title='Digite um email válido completo (exemplo: usuario@gmail.com)'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Use um email válido completo (ex: usuario@gmail.com)
              </p>
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
                placeholder='Mínimo 8 caracteres'
                className='w-full'
              />
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Confirmar senha
              </label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder='Digite a senha novamente'
                className='w-full'
              />
            </div>

            <div className='flex items-center'>
              <input
                id='terms'
                name='terms'
                type='checkbox'
                required
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label
                htmlFor='terms'
                className='ml-2 block text-sm text-gray-900'
              >
                Eu aceito os Termos de Uso e a Política de Privacidade
              </label>
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full'
              size='lg'
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
