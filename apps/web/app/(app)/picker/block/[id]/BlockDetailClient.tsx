'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, Package, CheckCircle2, Circle,
  Loader2, Camera, AlertCircle, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

type Item = {
  name: string
  quantity: string
  unit: string
  checked?: boolean
}

export default function BlockDetailClient({ initialBlock, token, userId }: any) {
  const router = useRouter()
  const [block, setBlock] = useState(initialBlock)
  const [items, setItems] = useState<Item[]>(
    (initialBlock.items || []).map((it: Item) => ({ ...it, checked: false }))
  )
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const checkedCount = items.filter(i => i.checked).length
  const allChecked = checkedCount === items.length && items.length > 0

  const toggleItem = (index: number) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, checked: !it.checked } : it))
  }

  const handleStartPicking = useCallback(async () => {
    if (block.status !== 'PENDING') return
    setSaving(true); setError('')
    try {
      const updated = await api.patch(`/blocks/${block.id}`, { status: 'PICKING', pickerId: userId }, token)
      setBlock(updated)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }, [block, token, userId])

  const handleComplete = useCallback(async () => {
    if (!allChecked) return
    setCompleting(true); setError('')
    try {
      const updated = await api.patch(`/blocks/${block.id}`, { status: 'COMPLETED' }, token)
      setBlock(updated)
      setSuccess(true)
      setTimeout(() => router.push('/picker'), 1500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCompleting(false)
    }
  }, [allChecked, block, token, router])

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
        <div>
          <h1 className="text-xl font-bold text-white">{block.supplierName}</h1>
          <p className="text-sm text-slate-400">Cliente: {block.clientName}</p>
        </div>
      </div>

      {/* Status card */}
      <div className={cn(
        'rounded-2xl p-4 ring-1',
        block.status === 'PENDING' && 'bg-orange-500/10 ring-orange-500/20',
        block.status === 'PICKING' && 'bg-blue-500/10 ring-blue-500/20',
        block.status === 'COMPLETED' && 'bg-emerald-500/10 ring-emerald-500/20',
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Status</p>
            <p className={cn(
              'text-lg font-bold',
              block.status === 'PENDING' && 'text-orange-400',
              block.status === 'PICKING' && 'text-blue-400',
              block.status === 'COMPLETED' && 'text-emerald-400',
            )}>
              {block.status === 'PENDING' ? 'Aguardando início' :
               block.status === 'PICKING' ? 'Em separação' : 'Concluído'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Progresso</p>
            <p className="text-2xl font-bold text-white">{checkedCount}<span className="text-slate-500 text-base">/{items.length}</span></p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              block.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${items.length ? (checkedCount / items.length) * 100 : 0}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Action button — start picking */}
      {block.status === 'PENDING' && (
        <button
          onClick={handleStartPicking}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition-all"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
          Iniciar Separação
        </button>
      )}

      {/* Items list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
          Itens do bloco
        </h2>

        {items.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum item registrado</p>
          </div>
        )}

        <AnimatePresence>
          {items.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => block.status === 'PICKING' && toggleItem(i)}
              disabled={block.status !== 'PICKING'}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left',
                block.status === 'PICKING' && 'cursor-pointer',
                item.checked
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700',
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
              )}>
                {item.checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  'font-semibold text-sm transition-colors',
                  item.checked ? 'text-slate-400 line-through' : 'text-white'
                )}>
                  {item.name}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className={cn(
                  'text-sm font-bold',
                  item.checked ? 'text-slate-500' : 'text-emerald-400'
                )}>
                  {item.quantity}
                </p>
                <p className="text-xs text-slate-500">{item.unit}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Complete button */}
      {block.status === 'PICKING' && (
        <motion.button
          onClick={handleComplete}
          disabled={!allChecked || completing || success}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all',
            allChecked
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          )}
          whileTap={allChecked ? { scale: 0.98 } : {}}
        >
          {completing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : success ? (
            <><CheckCircle2 className="w-5 h-5" /> Concluído!</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" /> Finalizar Coleta {!allChecked && `(${checkedCount}/${items.length})`}</>
          )}
        </motion.button>
      )}

      {block.status === 'COMPLETED' && (
        <div className="flex items-center justify-center gap-2 py-4 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          Coleta finalizada
        </div>
      )}
    </div>
  )
}
