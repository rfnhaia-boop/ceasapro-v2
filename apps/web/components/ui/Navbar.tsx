'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Package, Truck, Users, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar({ user }: { user: any }) {
  const pathname = usePathname()
  const role = user?.role

  const navItems = [
    ...(role === 'ADMIN' ? [{ path: '/', icon: LayoutDashboard, label: 'Painel' }] : []),
    { path: '/picker', icon: Package, label: 'Coletas' },
    { path: '/deliveries', icon: Truck, label: 'Entregas' },
    ...(role === 'ADMIN' ? [{ path: '/equipe', icon: Users, label: 'Equipe' }] : []),
  ]

  return (
    <>
      {/* Top bar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">CP</div>
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block">Ceasa Pro</span>
          </div>

          <nav className="hidden md:flex bg-slate-900/80 p-1 rounded-xl ring-1 ring-slate-800/60">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = pathname === path || (path !== '/' && pathname.startsWith(path))
              return (
                <Link key={path} href={path} className={cn(
                  'flex items-center px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                  active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}>
                  <Icon className="w-4 h-4 mr-2" />{label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">{role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold ring-2 ring-slate-900">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 text-slate-400 hover:text-orange-400 transition-colors rounded-xl hover:bg-slate-800">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 z-50">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <Link key={path} href={path} className={cn(
              'flex flex-col items-center p-2 min-w-[64px] rounded-xl text-[10px] font-bold uppercase tracking-widest',
              active ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-400'
            )}>
              <Icon className={cn('w-6 h-6 mb-1', active ? 'text-emerald-600' : 'text-slate-400')} />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
