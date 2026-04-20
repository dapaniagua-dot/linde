import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Linde – Capacitación en Transporte de CO₂',
  description: 'Plataforma de capacitación técnica para conductores de transporte de CO₂ líquido y gaseoso.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
