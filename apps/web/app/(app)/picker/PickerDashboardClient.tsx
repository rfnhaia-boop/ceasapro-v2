'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Package, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Search, Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const BLOCK_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PICKING: 'Separando',
  COMPLETED: 'Concluído',
}
const BLOCK_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  PICKING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}
const BLOCK_STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  PICKING: <Package className="w-4 h-4" />,
  COMPLETED: <CheckCircle2 className="w-4 h-4" />,
}

export default function PickerDashboardClient({ initialBlocks, token, userId, isAdmin }: any) {
  const [blocks] = useState(initialBlocks || [])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PICKING' | 'COMPLETED'>('ALL')

  const myBlocks = useMemo(() => {
    return blocks.filter((b: any) => isAdmin || b.pickerId === userId || b.pickerId === null)
  }, [blocks, userId, isAdmin])

  const filtered = useMemo(() => {
    return myBlocks.filter((b: any) => {
      const matchSearch = !search ||
        b.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
        b.clientName?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'ALL' || b.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [myBlocks, search, filterStatus])

  const counts = useMemo(() => ({
    total: myBlocks.length,
    pending: myBlocks.filter((b: any) => b.status === 'PENDING').length,
    picking: myBlocks.filter((b: any) => b.status === 'PICKING').length,
    completed: myBlocks.filter((b: any) => b.status === 'COMPLETED').length,
  }), [myBlocks])

  const tabs = [
    { key: 'ALL', label: 'Todos', count: counts.total },
    { key: 'PENDING', label: 'Pendentes', count: counts.pending },
    { key: 'PICKING', label: 'Em andamento', count: counts.picking },
    { key: 'COMPLETED', label: 'Concluídos', count: counts.completed },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Coletas</h1>
        <p className="text-slate-400 text-sm mt-1">Blocos de separação para retirada</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'from-slate-700 to-slate-800', icon: <Package className="w-5 h-5 text-slate-300" /> },
          { label: 'Pendentes', value: counts.pending, color: 'from-orange-600/20 to-orange-700/10', icon: <Clock className="w-5 h-5 text-orange-400" /> },
          { label: 'Separando', value: counts.picking, color: 'from-blue-600/20 to-blue-700/10', icon: <Package className="w-5 h-5 text-blue-400" /> },
          { label: 'Concluídos', value: counts.completed, color: 'from-emerald-600/20 to-emerald-700/10', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 ring-1 ring-white/5`}>
            <div className="flex items-center justify-between mb-2">
              {s.icon}
              <span className="text-2xl font-bold text-white">{s.value}</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por fornecedor ou cliente..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40"
          />
        </div>
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1 ring-1 ring-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filterStatus === tab.key
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {tab.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                filterStatus === tab.key ? 'bg-slate-600 text-slate-200' : 'bg-slate-800 text-slate-500'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Block list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhum bloco encontrado</p>
          <p className="text-sm mt-1">Aguarde novos pedidos serem criados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((block: any, i: number) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/picker/block/${block.id}`}>
                <div className="group bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border',
                          BLOCK_STATUS_COLORS[block.status]
                        )}>
                          {BLOCK_STATUS_ICONS[block.status]}
                          {BLOCK_STATUS_LABELS[block.status]}
                        </span>
                        <span className="text-xs text-slate-500">
                          {Array.isArray(block.items) ? block.items.length : 0} itens
                        </span>
                      </div>
                      <p className="font-semibold text-white truncate">{block.supplierName}</p>
                      <p className="text-sm text-slate-400 mt-0.5">Cliente: {block.clientName}</p>
                      {block.order && (
                        <p className="text-xs text-slate-500 mt-1">
                          Pedido: {block.order.clientName}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
