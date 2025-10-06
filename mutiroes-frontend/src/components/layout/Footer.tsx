import React from 'react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-gray-50 border-t border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-start'>
          {/* Logo e Descrição */}
          <div>
            <Link href='/' className='flex items-center space-x-2 mb-4'>
              <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>M</span>
              </div>
              <span className='text-xl font-semibold text-gray-900'>
                Mutirões
              </span>
            </Link>
            <p className='text-gray-600 text-sm leading-relaxed mb-6 max-w-md'>
              Conectando pessoas para criar um impacto positivo no meio ambiente
              através de ações comunitárias.
            </p>
          </div>

          {/* Links de Navegação */}
          <div className='flex flex-col md:items-end space-y-4'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wider'>
              Navegação
            </h3>
            <nav className='flex flex-col md:items-end space-y-3'>
              <Link
                href='/'
                className='text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200'
              >
                Página Inicial
              </Link>
              <Link
                href='/eventos'
                className='text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200'
              >
                Eventos
              </Link>
              <Link
                href='/sobre'
                className='text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200'
              >
                Sobre Nós
              </Link>
              <Link
                href='/perfil'
                className='text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200'
              >
                Meu Perfil
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='mt-8 pt-8 border-t border-gray-200'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-sm text-gray-500'>
              © {currentYear} Mutirões. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
