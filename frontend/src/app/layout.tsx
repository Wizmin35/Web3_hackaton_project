import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'GlamBook - Web3 Booking Platform',
  description: 'Book salon services and pay with crypto. Powered by Solana.',
  keywords: ['booking', 'salon', 'crypto', 'solana', 'web3', 'haircut', 'nails'],
  openGraph: {
    title: 'GlamBook - Web3 Booking Platform',
    description: 'Book salon services and pay with crypto. Powered by Solana.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#171717',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                padding: '16px',
                fontFamily: 'var(--font-geist-sans)',
              },
              success: {
                iconTheme: {
                  primary: '#ec4899',
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
        </Providers>
      </body>
    </html>
  )
}
