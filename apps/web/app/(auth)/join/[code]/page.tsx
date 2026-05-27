'use client'
import { signIn, useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.apiToken && code) {
      setStatus('loading')
      api.post('/auth/join', {
        code,
        googleId: (session.user as any).googleId,
        email: session.user.email,
        name: session.user.name,
        avatar: session.user.image,
      })
        .then(() => router.push('/'))
        .catch((e) => { setError(e.message); setStatus('error') })
    }
  }, [session, code])

  const handleLogin = () => signIn('google', { callbackUrl: `/join/${code}` })

  return (
    <div className="min-h-screen bg-[#090b10] flex items-center justify-center p-4">
      <div className="bg-[#13161c] border border-slate-800/50 rounded-3xl p-8 max-w-sm w-full">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg mb-6">CP</div>
        <h2 className="text-white font-bold text-xl mb-2">Você foi convidado!</h2>
        <p className="text-slate-400 text-sm mb-8">Código: <span className="font-mono text-emerald-400 font-bold">{code}</span></p>

        {status === 'error' && <p className="text-red-400 text-sm mb-4 bg-red-950/30 p-3 rounded-xl">{error}</p>}
        {status === 'loading' && <p className="text-slate-400 text-sm">Entrando na empresa...</p>}

        {!session && (
          <button onClick={handleLogin} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-500 transition-colors">
            Entrar com Google para aceitar
          </button>
        )}
      </div>
    </div>
  )
}
