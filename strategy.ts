
import { create } from 'zustand'

export type Settings = {
  baseOrderUsd: number            // size of each DCA buy
  maxSteps: number                // ladder steps
  stepDropPct: number             // % drop between steps
  slippagePct: number             // trade slippage
  maxExposureUsd: number          // cap total active exposure
  takeProfitPct: number           // TP from avg cost
  targetWeeklyPct: number         // NEW: weekly target (8%)
  maxUnrealizedDrawdownPct: number // NEW: tolerate up to 50% unrealized
  maxRealizedLossPct: number       // NEW: cap realized loss on exits (5%)
  totalCapitalUsd: number          // NEW: current total capital
}

export const DEFAULT_SETTINGS: Settings = {
  baseOrderUsd: 100,
  maxSteps: 5,
  stepDropPct: 6,
  slippagePct: 1,
  maxExposureUsd: 1000,
  takeProfitPct: 8,
  targetWeeklyPct: 8,
  maxUnrealizedDrawdownPct: 50,
  maxRealizedLossPct: 5,
  totalCapitalUsd: 2500
}

export function resizedBaseOrderFromCapital(totalCapitalUsd: number) {
  // Simple proportional sizing: 4% of capital per base order, min $25
  const size = Math.max(25, Math.round(totalCapitalUsd * 0.04))
  return size
}

type Store = {
  settings: Settings
  setSettings: (s: Settings) => void
  injectCapital: (addedUsd: number) => void
}

export const useDcaStore = create<Store>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  setSettings: (s) => set({ settings: s }),
  injectCapital: (addedUsd: number) => {
    const s = get().settings
    const newTotal = s.totalCapitalUsd + addedUsd
    const newBase = resizedBaseOrderFromCapital(newTotal)
    const newMaxExposure = Math.max(newBase * 8, Math.round(newTotal * 0.4)) // cap exposure near 40% or 8x base
    set({
      settings: {
        ...s,
        totalCapitalUsd: newTotal,
        baseOrderUsd: newBase,
        maxExposureUsd: newMaxExposure
      }
    })
  }
}))
