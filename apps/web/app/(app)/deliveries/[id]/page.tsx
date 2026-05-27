import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import DeliveryDetailClient from './DeliveryDetailClient'

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return null

  const order = await api.get(`/orders/${id}`, session.apiToken).catch(() => null)
  if (!order) return <div className="p-8 text-slate-400">Pedido não encontrado.</div>

  return (
    <DeliveryDetailClient
      initialOrder={order}
      token={session.apiToken}
      userId={session.user.id}
      isAdmin={session.user.role === 'ADMIN'}
    />
  )
}
