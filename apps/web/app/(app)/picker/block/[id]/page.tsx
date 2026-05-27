import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import BlockDetailClient from './BlockDetailClient'

export default async function BlockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return null

  const block = await api.get(`/blocks/${id}`, session.apiToken).catch(() => null)
  if (!block) return <div className="p-8 text-slate-400">Bloco não encontrado.</div>

  return (
    <BlockDetailClient
      initialBlock={block}
      token={session.apiToken}
      userId={session.user.id}
    />
  )
}
