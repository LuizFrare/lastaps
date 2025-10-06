'use client'

import React from 'react'
import {
  HeartIcon,
  UsersIcon,
  GlobeAltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden'>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
              Sobre a <span className='text-blue-600'>Mutirões</span>
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed'>
              Conectando pessoas para criar um impacto positivo no meio ambiente
              através de ações comunitárias organizadas e eficazes.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
                Nossa Missão
              </h2>
              <p className='text-lg text-gray-600 mb-6'>
                Facilitar a organização de eventos de limpeza, plantio e
                monitoramento cidadão, conectando pessoas que compartilham a
                paixão por um mundo mais sustentável.
              </p>
              <p className='text-lg text-gray-600 mb-8'>
                Acreditamos que pequenas ações individuais, quando organizadas e
                coordenadas, podem gerar grandes transformações ambientais e
                sociais.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link href='/cadastro'>
                  <Button size='lg'>Junte-se à Nossa Causa</Button>
                </Link>
                <Link href='/eventos'>
                  <Button variant='outline' size='lg'>
                    Ver Eventos
                  </Button>
                </Link>
              </div>
            </div>
            <div className='relative'>
              <div className='aspect-square bg-gradient-to-br from-blue-400 to-green-400 rounded-2xl flex items-center justify-center'>
                <HeartIcon className='h-32 w-32 text-white opacity-80' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Nossos Valores
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Os princípios que guiam nossa plataforma e comunidade
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <CardHeader>
                <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <UsersIcon className='h-6 w-6 text-blue-600' />
                </div>
                <CardTitle>Comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Construímos uma rede de pessoas comprometidas com o meio
                  ambiente e o bem-estar coletivo.
                </p>
              </CardContent>
            </Card>

            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <CardHeader>
                <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <GlobeAltIcon className='h-6 w-6 text-green-600' />
                </div>
                <CardTitle>Sustentabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Promovemos ações que respeitam e preservam o meio ambiente
                  para futuras gerações.
                </p>
              </CardContent>
            </Card>

            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <CardHeader>
                <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <SparklesIcon className='h-6 w-6 text-purple-600' />
                </div>
                <CardTitle>Inovação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Utilizamos tecnologia para facilitar e otimizar a organização
                  de ações comunitárias.
                </p>
              </CardContent>
            </Card>

            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <CardHeader>
                <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <ShieldCheckIcon className='h-6 w-6 text-orange-600' />
                </div>
                <CardTitle>Transparência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Mantemos total transparência em nossas ações e resultados,
                  promovendo confiança na comunidade.
                </p>
              </CardContent>
            </Card>

            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <CardHeader>
                <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <ChartBarIcon className='h-6 w-6 text-red-600' />
                </div>
                <CardTitle>Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Medimos e comunicamos o impacto real de cada ação para
                  inspirar mais pessoas a participar.
                </p>
              </CardContent>
            </Card>

            <Card className='text-center hover:shadow-lg transition-shadow duration-300'>
              <CardHeader>
                <div className='w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <HeartIcon className='h-6 w-6 text-indigo-600' />
                </div>
                <CardTitle>Paixão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>
                  Acreditamos que a paixão pelo meio ambiente é o motor para
                  mudanças positivas e duradouras.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
              Nosso Impacto
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Números que mostram a diferença que estamos fazendo juntos
            </p>
          </div>
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

      {/* CTA Section */}
      <section className='py-20 bg-blue-600'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
            Pronto para fazer parte da mudança?
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
            <Link href='/eventos'>
              <Button
                variant='outline'
                size='lg'
                className='text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600'
              >
                Ver Eventos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
