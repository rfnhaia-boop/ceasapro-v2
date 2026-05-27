'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  Truck, Clock, PackageCheck, CheckCircle2,
  ChevronRight, Search, MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PICKING: 'Separando',
  READY: 'Pronto p/ entrega',
  DELIVERED: 'Entregue',
}
const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  PICKING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  READY: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export default function DriverDashboardClient({ initialOrders, token, userId, isAdmin }: any) {
  const [orders] = useState(initialOrders || [])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'READY' | 'DELIVERED'>('ALL')

  const myOrders = useMemo(() => {
    if (isAdmin) return orders
    return orders.filter((o: any) => o.driverId === userId || o.driverId === null || o.status === 'READY')
  }, [orders, userId, isAdmin])

  const filtered = useMemo(() => {
    return myOrders.filter((o: any) => {
      const matchSearch = !search || o.clientName?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'ALL' || o.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [myOrders, search, filterStatus])

  const counts = useMemo(() => ({
    ready: myOrders.filter((o: any) => o.status === 'READY').length,
    delivered: myOrders.filter((o: any) => o.status === 'DELIVERED').length,
    total: myOrders.length,
  }), [myOrders])

  const tabs = [
    { key: 'ALL', label: 'Todos', count: counts.total },
    { key: 'READY', label: 'Prontos', count: counts.ready },
    { key: 'DELIVERED', label: 'Entregues', count: counts.delivered },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Entregas</h1>
        <p className="text-slate-400 text-sm mt-1">Pedidos prontos para entrega</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: counts.total, icon: <Truck className="w-5 h-5 text-slate-300" />, color: 'from-slate-700 to-slate-800' },
          { label: 'Prontos', value: counts.ready, icon: <PackageCheck className="w-5 h-5 text-yellow-400" />, color: 'from-yellow-600/20 to-yellow-700/10' },
          { label: 'Entregues', value: counts.delivered, icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, color: 'from-emerald-600/20 to-emerald-700/10' },
        ].map(s => (
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
            placeholder="Buscar por cliente..."
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
                filterStatus === tab.key ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
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

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Truck className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma entrega encontrada</p>
          <p className="text-sm mt-1">Aguarde pedidos ficarem prontos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any, i: number) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/deliveries/${order.id}`}>
                <div className="group bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border',
                          ORDER_STATUS_COLORS[order.status]
                        )}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        {order.nfNumber && (
                          <span className="text-xs text-slate-500">NF: {order.nfNumber}</span>
                        )}
                      </div>
                      <p className="font-semibold text-white truncate">{order.clientName}</p>
                      {order.deliveryNotes && (
                        <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{order.deliveryNotes}</span>
                        </p>
                      )}
                      {order.blocks && (
                        <p className="text-xs text-slate-500 mt-1">
                          {order.blocks.length} bloco{order.blocks.length !== 1 ? 's' : ''}
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
