import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Growth Planner',
  description: 'Personalized 6-month development roadmap powered by AI',
  keywords: ['career growth', 'AI planning', 'professional development', 'OKRs', 'skill development'],
  authors: [{ name: 'AI Growth Planner' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aigrowthplanner.com',
    title: 'AI Growth Planner',
    description: 'Personalized 6-month development roadmap powered by AI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
