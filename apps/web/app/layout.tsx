import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/providers'

export const metadata: Metadata = {
  title: 'Ceasa Pro',
  description: 'Sistema de gestão de pedidos e entregas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#090b10] text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
