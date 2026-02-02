import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GameStore - Управление промптами',
  description: 'SaaS приложение для управления промптами',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  )
}
