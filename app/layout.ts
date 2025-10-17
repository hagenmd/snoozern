import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SnoozeRN - Sleep Tracker for Healthcare Workers',
  description: 'Optimize your sleep schedule for shift work',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
