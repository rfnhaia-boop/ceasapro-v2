import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return <div className="p-8 text-slate-400">Sem permissão.</div>

  const [orders, company, team, purchases] = await Promise.all([
    api.get('/orders', session.apiToken),
    api.get('/companies', session.apiToken),
    api.get('/companies/members', session.apiToken),
    api.get('/purchases', session.apiToken),
  ]).catch(() => [[], null, [], []])

  return <AdminDashboardClient initialOrders={orders} company={company} initialTeam={team} initialPurchases={purchases} token={session.apiToken} userId={session.user.id} />
}
