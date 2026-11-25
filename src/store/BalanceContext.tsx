import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Balances, Currency } from '../types'
import { roundPayout } from '../utils/format'

const STORAGE_KEY = 'stellaris.balances.v1'

const DEFAULT: Balances = { stars: 500, ton: 2.5 }

function load(): Balances {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<Balances>
    return {
      stars: typeof parsed.stars === 'number' ? parsed.stars : DEFAULT.stars,
      ton: typeof parsed.ton === 'number' ? parsed.ton : DEFAULT.ton,
    }
  } catch {
    return { ...DEFAULT }
  }
}

interface BalanceApi {
  balances: Balances
  canAfford: (amount: number, currency: Currency) => boolean
  placeBet: (amount: number, currency: Currency) => boolean
  credit: (amount: number, currency: Currency) => void
  topUp: (amount: number, currency: Currency) => void
}

const Ctx = createContext<BalanceApi | null>(null)

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<Balances>(load)

  const persist = useCallback((next: Balances) => {
    setBalances(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const canAfford = useCallback(
    (amount: number, currency: Currency) => balances[currency] >= amount,
    [balances],
  )

  const placeBet = useCallback(
    (amount: number, currency: Currency) => {
      if (amount <= 0 || balances[currency] < amount) return false
      const next = {
        ...balances,
        [currency]: roundPayout(balances[currency] - amount, currency),
      }
      persist(next)
      return true
    },
    [balances, persist],
  )

  const credit = useCallback(
    (amount: number, currency: Currency) => {
      if (amount <= 0) return
      persist({
        ...balances,
        [currency]: roundPayout(balances[currency] + amount, currency),
      })
    },
    [balances, persist],
  )

  const topUp = useCallback(
    (amount: number, currency: Currency) => {
      if (amount <= 0) return
      persist({
        ...balances,
        [currency]: roundPayout(balances[currency] + amount, currency),
      })
    },
    [balances, persist],
  )

  const value = useMemo(
    () => ({ balances, canAfford, placeBet, credit, topUp }),
    [balances, canAfford, placeBet, credit, topUp],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useBalance(): BalanceApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useBalance outside provider')
  return ctx
}
