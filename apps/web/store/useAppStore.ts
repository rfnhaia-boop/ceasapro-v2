import { create } from 'zustand'

interface AppState {
  orders: any[]
  blocks: any[]
  purchases: any[]
  team: any[]
  company: any | null
  setOrders: (orders: any[]) => void
  setBlocks: (blocks: any[]) => void
  setPurchases: (purchases: any[]) => void
  setTeam: (team: any[]) => void
  setCompany: (company: any) => void
}

export const useAppStore = create<AppState>((set) => ({
  orders: [],
  blocks: [],
  purchases: [],
  team: [],
  company: null,
  setOrders: (orders) => set({ orders }),
  setBlocks: (blocks) => set({ blocks }),
  setPurchases: (purchases) => set({ purchases }),
  setTeam: (team) => set({ team }),
  setCompany: (company) => set({ company }),
}))
