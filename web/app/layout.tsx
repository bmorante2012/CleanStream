import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CleanStream - Sync Reactions with Official Music',
  description: 'Watch reaction videos synced to official music sources. No copyright issues.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <header className="border-b border-[var(--border)] bg-[var(--background)]">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-[var(--primary)]">
              CleanStream
            </a>
            <nav className="flex gap-4">
              <a href="/create" className="hover:text-[var(--primary)] transition-colors">
                Create Sync Pack
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
            CleanStream - Helping reactors stay copyright-compliant
          </div>
        </footer>
      </body>
    </html>
  )
}
