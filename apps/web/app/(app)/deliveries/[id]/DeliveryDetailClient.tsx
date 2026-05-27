'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, Truck, CheckCircle2, Package,
  Loader2, AlertCircle, MapPin, FileText,
  Camera, Edit3, Clock, PackageCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PICKING: 'Separando',
  READY: 'Pronto p/ entrega',
  DELIVERED: 'Entregue',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  PICKING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  READY: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  DELIVERED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

export default function DeliveryDetailClient({ initialOrder, token, userId, isAdmin }: any) {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [saving, setSaving] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Edit fields
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingNF, setEditingNF] = useState(false)
  const [notes, setNotes] = useState(order.deliveryNotes || '')
  const [nfNumber, setNfNumber] = useState(order.nfNumber || '')

  const handleSaveNotes = useCallback(async () => {
    setSaving(true); setError('')
    try {
      const updated = await api.patch(`/orders/${order.id}`, { deliveryNotes: notes }, token)
      setOrder(updated)
      setEditingNotes(false)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }, [order.id, notes, token])

  const handleSaveNF = useCallback(async () => {
    setSaving(true); setError('')
    try {
      const updated = await api.patch(`/orders/${order.id}`, { nfNumber }, token)
      setOrder(updated)
      setEditingNF(false)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }, [order.id, nfNumber, token])

  const handleAssignDriver = useCallback(async () => {
    if (order.driverId) return
    setSaving(true); setError('')
    try {
      const updated = await api.patch(`/orders/${order.id}`, { driverId: userId }, token)
      setOrder(updated)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }, [order, userId, token])

  const handleDeliver = useCallback(async () => {
    setDelivering(true); setError('')
    try {
      const updated = await api.patch(`/orders/${order.id}`, { status: 'DELIVERED' }, token)
      setOrder(updated)
      setSuccess(true)
      setTimeout(() => router.push('/deliveries'), 1500)
    } catch (e: any) { setError(e.message) }
    finally { setDelivering(false) }
  }, [order.id, token, router])

  const canDeliver = order.status === 'READY' || (isAdmin && order.status !== 'DELIVERED')

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
            <h1 className="text-xl font-bold text-white">{order.clientName}</h1>
            <span className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full border',
              STATUS_COLORS[order.status]
            )}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          {order.nfNumber && <p className="text-sm text-slate-400 mt-0.5">NF: {order.nfNumber}</p>}
        </div>
      </div>

      {/* NF Number */}
      <div className="bg-slate-900 rounded-2xl p-4 ring-1 ring-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <FileText className="w-4 h-4" />
            Nota Fiscal
          </div>
          {!editingNF && (
            <button onClick={() => setEditingNF(true)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
        {editingNF ? (
          <div className="flex gap-2 mt-2">
            <input
              value={nfNumber}
              onChange={e => setNfNumber(e.target.value)}
              placeholder="Número da NF..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              autoFocus
            />
            <button onClick={handleSaveNF} disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </button>
            <button onClick={() => setEditingNF(false)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-xl transition-all">
              Cancelar
            </button>
          </div>
        ) : (
          <p className="text-white text-sm mt-1">{order.nfNumber || <span className="text-slate-500 italic">Não informado</span>}</p>
        )}
      </div>

      {/* Delivery Notes */}
      <div className="bg-slate-900 rounded-2xl p-4 ring-1 ring-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <MapPin className="w-4 h-4" />
            Observações de Entrega
          </div>
          {!editingNotes && (
            <button onClick={() => setEditingNotes(true)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
        {editingNotes ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Endereço de entrega, horário, instruções especiais..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveNotes} disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </button>
              <button onClick={() => setEditingNotes(false)} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-xl transition-all">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-white text-sm mt-1 whitespace-pre-wrap">{order.deliveryNotes || <span className="text-slate-500 italic">Sem observações</span>}</p>
        )}
      </div>

      {/* Blocks summary */}
      {order.blocks && order.blocks.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 ring-1 ring-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Package className="w-4 h-4" />
            Blocos ({order.blocks.length})
          </div>
          {order.blocks.map((block: any) => (
            <div key={block.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{block.supplierName}</p>
                <p className="text-xs text-slate-500">{block.clientName}</p>
              </div>
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                block.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                block.status === 'PICKING' ? 'bg-blue-500/10 text-blue-400' :
                'bg-orange-500/10 text-orange-400'
              )}>
                {block.status === 'COMPLETED' ? 'Separado' : block.status === 'PICKING' ? 'Separando' : 'Pendente'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Assign self as driver */}
      {!order.driverId && order.status !== 'DELIVERED' && (
        <button
          onClick={handleAssignDriver}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-2 transition-all text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
          Assumir como entregador
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Deliver button */}
      {canDeliver && (
        <motion.button
          onClick={handleDeliver}
          disabled={delivering || success}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          whileTap={{ scale: 0.98 }}
        >
          {delivering ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : success ? (
            <><CheckCircle2 className="w-5 h-5" /> Entrega Confirmada!</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" /> Confirmar Entrega</>
          )}
        </motion.button>
      )}

      {order.status === 'DELIVERED' && !canDeliver && (
        <div className="flex items-center justify-center gap-2 py-4 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          Entrega finalizada
        </div>
      )}
    </div>
  )
}
