import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import NotificationInit from '@/components/NotificationInit'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Hub',
  description: 'Personal project management dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <NotificationInit />
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-gray-900 text-lg">Project Hub</a>
            <a
              href="/projects/new"
              className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              + New Project
            </a>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
