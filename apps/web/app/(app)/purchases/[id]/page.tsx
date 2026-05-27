import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import PurchaseDetailsClient from './PurchaseDetailsClient'

export default async function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return null

  const purchase = await api.get(`/purchases/${id}`, session.apiToken).catch(() => null)
  if (!purchase) return <div className="p-8 text-slate-400">Compra não encontrada.</div>

  return (
    <PurchaseDetailsClient
      initialPurchase={purchase}
      token={session.apiToken}
      isAdmin={session.user.role === 'ADMIN'}
    />
  )
}
