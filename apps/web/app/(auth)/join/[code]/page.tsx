'use client'
import { signIn, useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  // Quando o usuário já está logado E tem um apiToken (logado via Google),
  // verificamos se ele já tem empresa. Se não, o backend de /auth/google
  // já cuida do join — basta redirecionar com o código como parâmetro.
  // O fluxo correto: usuário clica em Entrar com Google → callbackUrl inclui o código
  // → signIn callback no auth.ts chama /auth/google que cria/atualiza o usuário.
  // Para join via convite, precisamos de um fluxo separado pós-login.
  useEffect(() => {
    if (status === 'loading') return
    if (session?.apiToken && code) {
      // Usuário já logado — redirecionar para processar o convite via API
      setJoining(true)
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/join-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.apiToken}`,
        },
        body: JSON.stringify({ code }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'Código inválido')
          }
          return res.json()
        })
        .then(() => router.push('/'))
        .catch((e) => { setError(e.message); setJoining(false) })
    }
  }, [session, status, code])

  const handleLogin = () =>
    signIn('google', { callbackUrl: `/join/${code}` })

  if (status === 'loading' || joining) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090b10] flex items-center justify-center p-4">
      <div className="bg-[#13161c] border border-slate-800/50 rounded-3xl p-8 max-w-sm w-full">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg mb-6">
          CP
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Você foi convidado!</h2>
        <p className="text-slate-400 text-sm mb-8">
          Código: <span className="font-mono text-emerald-400 font-bold">{code}</span>
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-4 bg-red-950/30 p-3 rounded-xl border border-red-900/30">
            {error}
          </p>
        )}

        {!session ? (
          <button
            onClick={handleLogin}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-500 transition-colors"
          >
            Entrar com Google para aceitar
          </button>
        ) : (
          <p className="text-slate-400 text-sm text-center">Processando convite...</p>
        )}
      </div>
    </div>
  )
}
