import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DEMA Group - Unified Industrial Platform',
  description: 'Your one-stop shop for industrial supplies: pumps, valves, pipes, tools, conveyors, and precision components.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <LanguageProvider>
          <a href="#main-content" className="sr-only">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="min-h-screen" role="main" aria-label="Main content">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
