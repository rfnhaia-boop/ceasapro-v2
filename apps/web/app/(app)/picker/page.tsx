import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import PickerDashboardClient from './PickerDashboardClient'

export default async function PickerPage() {
  const session = await auth()
  if (!session) return null
  if (session.user.role === 'DRIVER') return <div className="p-8 text-slate-400">Sem permissão.</div>

  const blocks = await api.get('/blocks', session.apiToken).catch(() => [])

  return (
    <PickerDashboardClient
      initialBlocks={blocks}
      token={session.apiToken}
      userId={session.user.id}
      isAdmin={session.user.role === 'ADMIN'}
    />
  )
}
