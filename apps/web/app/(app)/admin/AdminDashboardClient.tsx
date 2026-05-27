'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Plus, ShoppingCart, UserPlus, Trash2, Loader2, Eye,
  Building2, TrendingUp, PackageCheck, X, Check,
  ClipboardPaste, AlertCircle, Truck, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f97316', PICKING: '#3b82f6', READY: '#eab308', DELIVERED: '#10b981',
}
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente', PICKING: 'Separando', READY: 'Pronto', DELIVERED: 'Entregue',
  RECEIVING: 'Aguard. Chegada', ARRIVED: 'No Pátio', SEPARATED: 'Separado', COMPLETED: 'Concluído',
}

export default function AdminDashboardClient({ initialOrders, company, initialTeam, initialPurchases, token, userId }: any) {
  const [orders, setOrders] = useState(initialOrders || [])
  const [team] = useState(initialTeam || [])
  const [purchases, setPurchases] = useState(initialPurchases || [])
  const [activeTab, setActiveTab] = useState<'dashboard' | 'purchases' | 'team'>('dashboard')

  // Modais
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Novo Pedido
  const [orderText, setOrderText] = useState('')
  const [parsedOrder, setParsedOrder] = useState<any>(null)
  const [parsingOrder, setParsingOrder] = useState(false)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [selectedPicker, setSelectedPicker] = useState('')

  // Nova Compra
  const [purchaseText, setPurchaseText] = useState('')
  const [parsedPurchase, setParsedPurchase] = useState<any>(null)
  const [parsingPurchase, setParsingPurchase] = useState(false)
  const [creatingPurchase, setCreatingPurchase] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')

  // Convite
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'PICKER' | 'DRIVER'>('PICKER')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  // Limpar dados
  const [clearing, setClearing] = useState(false)

  const stats = useMemo(() => {
    const map: Record<string, number> = {}
    orders.forEach((o: any) => { map[o.status] = (map[o.status] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name: STATUS_LABELS[name] || name, value, color: STATUS_COLORS[name] || '#64748b' }))
  }, [orders])

  const totalActive = useMemo(() => orders.filter((o: any) => o.status !== 'DELIVERED').length, [orders])

  const handleParseOrder = async () => {
    if (!orderText.trim()) return
    setParsingOrder(true); setOrderError('')
    try {
      const data = await api.post('/ai/parse-list', { text: orderText }, token)
      setParsedOrder(data)
    } catch (e: any) { setOrderError(e.message) }
    finally { setParsingOrder(false) }
  }

  const handleCreateOrder = async () => {
    if (!parsedOrder) return
    setCreatingOrder(true)
    try {
      const order = await api.post('/orders', {
        clientName: parsedOrder.clientName,
        originalText: orderText,
        blocks: parsedOrder.blocks.map((b: any) => ({
          supplierName: b.supplierName || 'Fornecedor Não Identificado',
          items: b.items.map((item: any, i: number) => ({ id: `item_${i}`, ...item, isPicked: false })),
          pickerId: selectedPicker || null,
        })),
      }, token)
      setOrders([order, ...orders])
      setParsedOrder(null); setOrderText(''); setShowOrderModal(false)
      setSelectedPicker('')
    } catch (e: any) { setOrderError(e.message) }
    finally { setCreatingOrder(false) }
  }

  const handleParsePurchase = async () => {
    if (!purchaseText.trim()) return
    setParsingPurchase(true); setPurchaseError('')
    try {
      const data = await api.post('/ai/parse-purchase', { text: purchaseText }, token)
      setParsedPurchase(data)
    } catch (e: any) { setPurchaseError(e.message) }
    finally { setParsingPurchase(false) }
  }

  const handleCreatePurchase = async () => {
    if (!parsedPurchase) return
    setCreatingPurchase(true)
    try {
      const purchase = await api.post('/purchases', { originalText: purchaseText, destinations: parsedPurchase.destinations }, token)
      setPurchases([purchase, ...purchases])
      setParsedPurchase(null); setPurchaseText(''); setShowPurchaseModal(false)
    } catch (e: any) { setPurchaseError(e.message) }
    finally { setCreatingPurchase(false) }
  }

  const handleGenerateInvite = async () => {
    if (!inviteName.trim()) return
    setInviteLoading(true)
    try {
      const invite = await api.post('/companies/invites', { name: inviteName, role: inviteRole }, token)
      setInviteLink(`${window.location.origin}/join/${invite.code}`)
    } catch (e: any) { alert('Erro ao gerar convite') }
    finally { setInviteLoading(false) }
  }

  const handleClearData = async () => {
    if (!confirm('TEM CERTEZA? Isso apaga TODOS os pedidos e blocos. Irreversível.')) return
    setClearing(true)
    try { await api.del('/companies/data', token); setOrders([]) }
    catch { alert('Erro ao limpar dados.') }
    finally { setClearing(false) }
  }

  return (
    <div className="w-full text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header empresa */}
        {company && (
          <div className="bg-[#13161c] rounded-3xl p-6 md:p-8 border border-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                <Building2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">{company.name}</h1>
                <p className="text-sm text-slate-400 mt-0.5">Painel do Administrador</p>
              </div>
            </div>
            <div className="relative z-10 bg-[#090b10] p-4 rounded-2xl border border-slate-800/80 flex items-center gap-4 w-full md:w-auto">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Código de Convite</p>
                <p className="font-mono text-base font-bold text-emerald-400 tracking-widest">{company.inviteCode}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/join/${company.inviteCode}`); alert('Link copiado!') }}
                className="ml-auto bg-slate-800 p-2.5 rounded-xl hover:bg-slate-700 transition-colors">
                <ClipboardPaste className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Nova Venda', icon: Plus, color: 'emerald', onClick: () => setShowOrderModal(true) },
            { label: 'Nova Compra', icon: ShoppingCart, color: 'sky', onClick: () => setShowPurchaseModal(true) },
            { label: 'Novo Membro', icon: UserPlus, color: 'indigo', onClick: () => setShowInviteModal(true) },
            { label: clearing ? 'Limpando...' : 'Limpar Teste', icon: clearing ? Loader2 : Trash2, color: 'red', onClick: handleClearData },
          ].map(({ label, icon: Icon, color, onClick }) => (
            <button key={label} onClick={onClick} disabled={clearing && label.includes('Limpar')}
              className={`relative overflow-hidden bg-[#13161c] p-5 rounded-3xl border border-slate-800/50 hover:bg-[#1a1d24] transition-all flex flex-col items-start gap-4 group active:scale-[0.98] text-left disabled:opacity-70`}>
              <div className={`w-12 h-12 rounded-2xl bg-${color}-950/30 text-${color}-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-${color}-900/50`}>
                <Icon className={cn('w-6 h-6 stroke-[2.5]', clearing && label.includes('Limpar') && 'animate-spin')} />
              </div>
              <span className="font-bold text-base text-slate-200">{label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-[#13161c] p-1.5 rounded-2xl border border-slate-800/50">
          {(['dashboard', 'purchases', 'team'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('flex-1 py-3 px-4 font-bold text-sm tracking-wide rounded-xl transition-all',
                activeTab === tab ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              )}>
              {tab === 'dashboard' ? 'Pedidos' : tab === 'purchases' ? 'Compras' : 'Estatísticas'}
            </button>
          ))}
        </div>

        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 bg-[#13161c] rounded-3xl border border-slate-800/50 p-6 md:p-8">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Status dos Pedidos</h2>
                {stats.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-56 h-56 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                            {stats.map((s, i) => <Cell key={i} fill={s.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(30,41,59,.5)', backgroundColor: '#1e293b', color: '#f8fafc' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full flex-1">
                      {stats.map((s) => (
                        <div key={s.name} className="flex flex-col border border-slate-800/50 p-4 rounded-2xl bg-[#090b10]/50">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{s.name}</span>
                          </div>
                          <span className="text-3xl font-black text-white">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-slate-500 bg-[#090b10]/30 rounded-2xl border border-slate-800/30">
                    <PackageCheck className="w-10 h-10 mb-3 text-slate-700" />
                    <span className="font-medium text-sm">Nenhum pedido ainda.</span>
                  </div>
                )}
              </div>
              <div className="bg-emerald-600 rounded-3xl p-6 md:p-8 text-white flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400 rounded-full blur-[80px] -mr-16 -mt-16 opacity-40" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-3 relative z-10">Pedidos Ativos</h2>
                <p className="text-6xl font-black tracking-tighter relative z-10">{totalActive}</p>
                <div className="mt-6 flex items-center text-emerald-100/90 text-sm font-bold relative z-10 bg-emerald-700/30 self-start px-3 py-1.5 rounded-lg">
                  <TrendingUp className="w-4 h-4 mr-2" /> Aguardando conclusão
                </div>
              </div>
            </div>

            <div className="border-b border-slate-800/80 pb-3">
              <h2 className="text-xl font-bold text-white">Lista de Pedidos</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Acompanhamento em tempo real</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-24 bg-[#13161c] rounded-3xl border border-dashed border-slate-800 flex flex-col items-center gap-4">
                <PackageCheck className="w-12 h-12 text-slate-700" />
                <p className="font-bold">Nenhum pedido lançado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order: any) => (
                  <Link key={order.id} href={`/deliveries/${order.id}`}
                    className="bg-[#13161c] rounded-2xl border border-slate-800/50 p-6 hover:border-emerald-500/30 hover:bg-[#161a22] transition-all flex justify-between items-center group active:scale-[0.99]">
                    <div className="flex-1 mr-4 overflow-hidden">
                      <p className="font-bold text-white text-lg truncate mb-1">{order.clientName}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">ID: {order.id.slice(-6)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-[#090b10] px-1.5 py-1.5 rounded-xl border border-slate-800">
                      <span className={cn('text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-lg',
                        order.status === 'DELIVERED' ? 'bg-slate-800 text-slate-400' :
                        order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'
                      )}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Compras */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            {purchases.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-24 bg-[#13161c] rounded-3xl border border-dashed border-slate-800 flex flex-col items-center gap-4">
                <ShoppingCart className="w-12 h-12 text-slate-700" />
                <p className="font-bold">Nenhuma compra registrada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {purchases.map((p: any) => (
                  <div key={p.id} className="bg-[#13161c] rounded-2xl border border-slate-800/50 p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white text-lg">{p.destinations?.length || 0} Destinos</p>
                        <p className="text-[10px] text-slate-500 font-mono">ID: {p.id.slice(-6)}</p>
                      </div>
                      <span className={cn('text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border',
                        p.status === 'COMPLETED' ? 'bg-slate-500/10 text-slate-400 border-slate-700/50' :
                        p.status === 'SEPARATED' ? 'bg-sky-500/10 text-sky-400 border-sky-900/50' :
                        p.status === 'ARRIVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-900/50' :
                        'bg-orange-500/10 text-orange-400 border-orange-900/50'
                      )}>
                        {STATUS_LABELS[p.status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/purchases/${p.id}`} className="bg-sky-600/10 hover:bg-sky-600/20 text-sky-500 border border-sky-900/30 font-bold uppercase tracking-widest text-[10px] py-2.5 rounded-xl transition-colors flex justify-center items-center">
                        Ver Unificado
                      </Link>
                      <div className="bg-[#090b10] border border-slate-800 rounded-xl flex items-center justify-center p-2">
                        <Clock className="w-3.5 h-3.5 text-slate-500 mr-2" />
                        <span className="text-[10px] font-bold text-slate-400">
                          {p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Equipe */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-[#13161c] rounded-3xl border border-slate-800/50 p-6 md:p-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total de Membros</h2>
              <p className="text-5xl font-black text-white">{team.length}</p>
            </div>
            {team.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-24 bg-[#13161c] rounded-3xl border border-dashed border-slate-800">
                <p className="font-bold">Nenhum membro na equipe.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((m: any) => (
                  <div key={m.id} className="bg-[#13161c] rounded-3xl border border-slate-800/50 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-[#090b10] border border-slate-800 flex items-center justify-center text-xl font-black text-slate-400">
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{m.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{m.email}</p>
                      </div>
                    </div>
                    <span className={cn('text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border',
                      m.role === 'ADMIN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-900/50' :
                      m.role === 'PICKER' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-900/50' :
                      'bg-orange-500/10 text-orange-400 border-orange-900/50'
                    )}>
                      {m.role === 'ADMIN' ? 'Admin' : m.role === 'PICKER' ? 'Separador' : 'Entregador'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL — Novo Pedido */}
        <AnimatePresence>
          {showOrderModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090b10]/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#13161c] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-800/80 overflow-hidden">
                {!parsedOrder ? (
                  <>
                    <div className="p-6 md:p-8 flex justify-between items-center border-b border-slate-800/50">
                      <div>
                        <h3 className="font-bold text-2xl text-white">Lançar Novo Pedido</h3>
                        <p className="text-xs text-slate-400 mt-1">Cole a lista do WhatsApp para separar.</p>
                      </div>
                      <button onClick={() => { setShowOrderModal(false); setOrderText(''); setOrderError('') }} className="text-slate-400 hover:text-white bg-slate-800/50 rounded-full p-2.5 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                      <textarea value={orderText} onChange={e => setOrderText(e.target.value)}
                        className="w-full h-64 md:h-80 p-5 rounded-2xl border border-slate-700 bg-[#090b10] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-mono text-sm text-slate-200 placeholder:text-slate-600 outline-none"
                        placeholder="Cole aqui a lista do WhatsApp..." />
                      {orderError && <div className="mt-4 text-orange-400 text-sm bg-orange-950/30 p-4 rounded-xl border border-orange-900/50 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" />{orderError}</div>}
                    </div>
                    <div className="p-6 md:p-8 border-t border-slate-800/50 flex justify-end">
                      <button onClick={handleParseOrder} disabled={parsingOrder || !orderText.trim()}
                        className="flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-colors">
                        {parsingOrder ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <ClipboardPaste className="w-5 h-5 mr-3" />}
                        {parsingOrder ? 'Analisando...' : 'Avançar'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                      <div className="bg-[#090b10] p-6 rounded-2xl border border-slate-800/50 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Análise Concluída</p>
                          <p className="text-white font-bold text-xl">{parsedOrder.clientName}</p>
                        </div>
                        <button onClick={() => setParsedOrder(null)} className="bg-slate-800 p-2.5 rounded-xl text-[10px] uppercase font-black text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700">Alterar</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {parsedOrder.blocks.map((block: any, i: number) => (
                          <div key={i} className="bg-[#1a1d24] rounded-2xl border border-slate-800 overflow-hidden">
                            <div className="bg-[#13161c] px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                              <div className="bg-emerald-950 rounded-lg p-1.5 border border-emerald-900/50"><PackageCheck className="w-4 h-4 text-emerald-500" /></div>
                              <h3 className="font-bold text-white text-sm">{block.supplierName || 'Fornecedor Não Identificado'}</h3>
                            </div>
                            <ul className="divide-y divide-slate-800/50 px-5 py-2">
                              {block.items.map((item: any, j: number) => (
                                <li key={j} className="py-3 flex justify-between items-center text-sm">
                                  <span className="text-slate-300 font-medium truncate pr-3">{item.name}</span>
                                  <span className="shrink-0 font-mono text-white bg-slate-800 px-3 py-1.5 rounded-md text-xs font-bold border border-slate-700">{item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 md:p-8 bg-[#13161c] border-t border-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="w-full md:w-1/3">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Atribuir Separador (Opcional)</label>
                        <select value={selectedPicker} onChange={e => setSelectedPicker(e.target.value)}
                          className="w-full bg-[#090b10] border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none">
                          <option value="">Deixar em aberto</option>
                          {team.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.role === 'PICKER' ? 'Sep.' : p.role === 'DRIVER' ? 'Mot.' : 'Admin'})</option>)}
                        </select>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => setShowOrderModal(false)} className="flex-1 md:flex-none px-6 py-4 bg-slate-800 text-white font-bold text-xs uppercase rounded-xl hover:bg-slate-700 border border-slate-700">Cancelar</button>
                        <button onClick={handleCreateOrder} disabled={creatingOrder}
                          className="flex-1 md:flex-none flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-emerald-500 disabled:opacity-50">
                          {creatingOrder ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Check className="w-5 h-5 mr-3" />}
                          Salvar e Separar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL — Nova Compra */}
        <AnimatePresence>
          {showPurchaseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090b10]/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#13161c] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-800/80 overflow-hidden">
                {!parsedPurchase ? (
                  <>
                    <div className="p-6 md:p-8 flex justify-between items-center border-b border-slate-800/50">
                      <div>
                        <h3 className="font-bold text-2xl text-white">Nova Compra / Recepção</h3>
                        <p className="text-xs text-slate-400 mt-1">Cole a lista de compras para unificar.</p>
                      </div>
                      <button onClick={() => { setShowPurchaseModal(false); setPurchaseText(''); setPurchaseError('') }} className="text-slate-400 hover:text-white bg-slate-800/50 rounded-full p-2.5 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                      <textarea value={purchaseText} onChange={e => setPurchaseText(e.target.value)}
                        className="w-full h-64 md:h-80 p-5 rounded-2xl border border-slate-700 bg-[#090b10] focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none font-mono text-sm text-slate-200 placeholder:text-slate-600 outline-none"
                        placeholder="Cole aqui a lista de compras..." />
                      {purchaseError && <div className="mt-4 text-orange-400 text-sm bg-orange-950/30 p-4 rounded-xl border border-orange-900/50 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" />{purchaseError}</div>}
                    </div>
                    <div className="p-6 md:p-8 border-t border-slate-800/50 flex justify-end">
                      <button onClick={handleParsePurchase} disabled={parsingPurchase || !purchaseText.trim()}
                        className="flex items-center justify-center px-8 py-4 bg-sky-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-sky-500 disabled:opacity-50 transition-colors">
                        {parsingPurchase ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <ClipboardPaste className="w-5 h-5 mr-3" />}
                        {parsingPurchase ? 'Analisando...' : 'Avançar e Unificar'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                      <div className="bg-[#090b10] p-6 rounded-2xl border border-slate-800/50 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1">Lista Pronta</p>
                          <p className="text-white font-bold text-xl">{parsedPurchase.destinations?.length || 0} Destino(s)</p>
                        </div>
                        <button onClick={() => setParsedPurchase(null)} className="bg-slate-800 p-2.5 rounded-xl text-[10px] uppercase font-black text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700">Alterar</button>
                      </div>
                      {parsedPurchase.destinations?.map((dest: any, i: number) => (
                        <div key={i} className="bg-[#1a1d24] rounded-2xl border border-slate-800 overflow-hidden">
                          <div className="bg-[#13161c] px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                            <div className="bg-sky-950 rounded-lg p-1.5 border border-sky-900/50"><Truck className="w-4 h-4 text-sky-500" /></div>
                            <h3 className="font-bold text-white text-sm">{dest.name}</h3>
                          </div>
                          <ul className="divide-y divide-slate-800/50 px-5 py-2">
                            {dest.items?.map((item: any, j: number) => (
                              <li key={j} className="py-3 flex justify-between items-center text-sm gap-2">
                                <div className="flex-1 truncate">
                                  <span className="text-slate-300 font-medium">{item.name}</span>
                                  <span className="text-[10px] uppercase text-slate-500 ml-2 font-black">({item.supplier})</span>
                                </div>
                                <span className="shrink-0 font-mono text-white bg-slate-800 px-3 py-1.5 rounded-md text-xs font-bold border border-slate-700">{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 md:p-8 bg-[#13161c] border-t border-slate-800/50 flex gap-3 justify-end">
                      <button onClick={() => setShowPurchaseModal(false)} className="px-6 py-4 bg-slate-800 text-white font-bold text-xs uppercase rounded-xl hover:bg-slate-700 border border-slate-700">Cancelar</button>
                      <button onClick={handleCreatePurchase} disabled={creatingPurchase}
                        className="flex items-center justify-center px-8 py-4 bg-sky-600 text-white font-bold text-xs uppercase rounded-xl hover:bg-sky-500 disabled:opacity-50">
                        {creatingPurchase ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Check className="w-5 h-5 mr-3" />}
                        Salvar e Unificar
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL — Convite */}
        <AnimatePresence>
          {showInviteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090b10]/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#13161c] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800/80">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-white">Novo Funcionário</h3>
                  <button onClick={() => { setShowInviteModal(false); setInviteLink(''); setInviteName('') }} className="text-slate-400 hover:text-white bg-slate-800/50 rounded-full p-2.5 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                {!inviteLink ? (
                  <>
                    <div className="space-y-5 mb-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nome</label>
                        <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Ex: João Silva"
                          className="w-full bg-[#090b10] border border-slate-700 rounded-xl px-4 py-3 font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Função</label>
                        <div className="flex bg-[#090b10] p-1 rounded-xl border border-slate-700">
                          {(['PICKER', 'DRIVER'] as const).map((r) => (
                            <button key={r} onClick={() => setInviteRole(r)}
                              className={cn('flex-1 py-2.5 text-sm font-bold rounded-lg transition-all',
                                inviteRole === r ? 'bg-[#13161c] text-emerald-400 shadow-sm border border-slate-700/50' : 'text-slate-500 hover:text-slate-400 border border-transparent'
                              )}>
                              {r === 'PICKER' ? 'Separador' : 'Entregador'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={handleGenerateInvite} disabled={inviteLoading || !inviteName.trim()}
                      className="w-full bg-emerald-600 text-white font-bold py-4 text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center disabled:opacity-50">
                      {inviteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Link de Acesso'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-400 mb-6">Envie o link para <strong className="text-white">{inviteName}</strong>.</p>
                    <div className="bg-[#090b10] border border-slate-800 p-4 rounded-2xl mb-6">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Link de Convite</p>
                      <p className="font-mono text-emerald-400 font-bold break-all text-sm">{inviteLink}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(inviteLink); alert('Link copiado!'); setShowInviteModal(false); setInviteLink(''); setInviteName('') }}
                      className="w-full bg-slate-800 text-white font-bold py-4 text-xs uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center border border-slate-700">
                      <ClipboardPaste className="w-5 h-5 mr-2" /> Copiar Link
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
