import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Compare',
  description: 'Compare AI models',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
