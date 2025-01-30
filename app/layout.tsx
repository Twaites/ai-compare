import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from 'react-hot-toast'

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script defer data-domain="ai-compare.twaites.com" src="https://analytics.twaites.com/js/script.js"></script>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
