'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, ShoppingCart, CheckCircle2, Clock,
  Loader2, AlertCircle, Package, ChevronDown, ChevronUp,
  TrendingDown, MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

const STATUS_LABELS: Record<string, string> = {
  RECEIVING: 'Aguard. Chegada',
  ARRIVED: 'No Pátio',
  SEPARATED: 'Separado',
  COMPLETED: 'Concluído',
}
const STATUS_COLORS: Record<string, string> = {
  RECEIVING: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  ARRIVED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  SEPARATED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  COMPLETED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

const STATUS_FLOW = ['RECEIVING', 'ARRIVED', 'SEPARATED', 'COMPLETED']

export default function PurchaseDetailsClient({ initialPurchase, token, isAdmin }: any) {
  const router = useRouter()
  const [purchase, setPurchase] = useState(initialPurchase)
  const [advancing, setAdvancing] = useState(false)
  const [error, setError] = useState('')
  const [expandedDest, setExpandedDest] = useState<number | null>(0)

  const destinations: any[] = purchase.destinations || []
  const currentStatusIndex = STATUS_FLOW.indexOf(purchase.status)
  const nextStatus = STATUS_FLOW[currentStatusIndex + 1]

  const handleAdvanceStatus = useCallback(async () => {
    if (!nextStatus || !isAdmin) return
    setAdvancing(true); setError('')
    try {
      const updated = await api.patch(`/purchases/${purchase.id}`, { status: nextStatus }, token)
      setPurchase(updated)
    } catch (e: any) { setError(e.message) }
    finally { setAdvancing(false) }
  }, [nextStatus, isAdmin, purchase.id, token])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Compra</h1>
            <span className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full border',
              STATUS_COLORS[purchase.status]
            )}>
              {STATUS_LABELS[purchase.status]}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{destinations.length} destino{destinations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-slate-900 rounded-2xl p-4 ring-1 ring-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Progresso</p>
        <div className="flex items-center gap-0">
          {STATUS_FLOW.map((s, i) => {
            const done = STATUS_FLOW.indexOf(purchase.status) >= i
            const isLast = i === STATUS_FLOW.length - 1
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                    done ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-700'
                  )}>
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <p className={cn('text-[10px] font-semibold mt-1.5 text-center leading-tight', done ? 'text-emerald-400' : 'text-slate-500')}>
                    {STATUS_LABELS[s]}
                  </p>
                </div>
                {!isLast && (
                  <div className={cn('flex-1 h-0.5 mx-1 mb-5 rounded', done && STATUS_FLOW.indexOf(purchase.status) > i ? 'bg-emerald-500' : 'bg-slate-700')} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Destinations */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
          Destinos ({destinations.length})
        </h2>

        {destinations.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum destino registrado</p>
          </div>
        )}

        <AnimatePresence>
          {destinations.map((dest: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedDest(expandedDest === i ? null : i)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{dest.clientName || `Destino ${i + 1}`}</p>
                    <p className="text-xs text-slate-500">
                      {Array.isArray(dest.items) ? dest.items.length : 0} produto{(Array.isArray(dest.items) ? dest.items.length : 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {expandedDest === i ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <AnimatePresence>
                {expandedDest === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2 border-t border-slate-800 pt-3">
                      {(dest.items || []).map((item: any, j: number) => (
                        <div key={j} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            <p className="text-sm text-white">{item.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">{item.quantity}</p>
                            <p className="text-xs text-slate-500">{item.unit}</p>
                          </div>
                        </div>
                      ))}

                      {(!dest.items || dest.items.length === 0) && (
                        <p className="text-sm text-slate-500 italic py-2">Sem itens registrados</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Original text */}
      {purchase.originalText && (
        <div className="bg-slate-900 rounded-2xl p-4 ring-1 ring-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Texto original</p>
          <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{purchase.originalText}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Advance status (admin only) */}
      {isAdmin && nextStatus && (
        <motion.button
          onClick={handleAdvanceStatus}
          disabled={advancing}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          whileTap={{ scale: 0.98 }}
        >
          {advancing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Avançar para: {STATUS_LABELS[nextStatus]}
            </>
          )}
        </motion.button>
      )}

      {purchase.status === 'COMPLETED' && (
        <div className="flex items-center justify-center gap-2 py-4 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          Compra finalizada
        </div>
      )}
    </div>
  )
}
