import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mutirões - Plataforma de Ações Comunitárias',
  description:
    'Conecte-se com pessoas que compartilham sua paixão por um mundo mais sustentável. Participe de mutirões, ações comunitárias e crie um impacto real na sua região.',
  keywords: [
    'mutirões',
    'meio ambiente',
    'sustentabilidade',
    'voluntariado',
    'ações comunitárias',
    'limpeza',
    'plantio',
  ],
  authors: [{ name: 'Equipe Mutirões' }],
  creator: 'Mutirões',
  publisher: 'Mutirões',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mutiroes.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://mutiroes.com.br',
    title: 'Mutirões - Plataforma de Ações Comunitárias',
    description:
      'Conecte-se com pessoas que compartilham sua paixão por um mundo mais sustentável. Participe de mutirões, ações comunitárias e crie um impacto real na sua região.',
    siteName: 'Mutirões',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mutirões - Plataforma de Ações Comunitárias',
    description:
      'Conecte-se com pessoas que compartilham sua paixão por um mundo mais sustentável. Participe de mutirões, ações comunitárias e crie um impacto real na sua região.',
    creator: '@mutiroes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='pt-BR' className='scroll-smooth'>
      <head>
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link rel='manifest' href='/site.webmanifest' />
        <meta name='theme-color' content='#3b82f6' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=5'
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <div className='min-h-screen flex flex-col'>
            <Header />
            <main className='flex-1'>{children}</main>
            <Footer />
          </div>
        </AuthProvider>
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              borderRadius: '12px',
              boxShadow:
                '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
