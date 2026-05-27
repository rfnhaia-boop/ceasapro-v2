import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session.user} />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
