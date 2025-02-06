import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Matt's Website",
  description: 'Technology enthusiast and Linux lover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header>
          <nav>
            <a rel="me" href="https://mastodon.v0dev.cfd/@matt">Mastodon</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
