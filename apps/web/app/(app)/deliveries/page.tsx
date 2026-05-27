import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import DriverDashboardClient from './DriverDashboardClient'

export default async function DeliveriesPage() {
  const session = await auth()
  if (!session) return null
  if (session.user.role === 'PICKER') return <div className="p-8 text-slate-400">Sem permissão.</div>

  const orders = await api.get('/orders', session.apiToken).catch(() => [])

  return (
    <DriverDashboardClient
      initialOrders={orders}
      token={session.apiToken}
      userId={session.user.id}
      isAdmin={session.user.role === 'ADMIN'}
    />
  )
}
