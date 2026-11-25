import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { GameShell } from '../components/GameShell'
import { BetPanel } from '../components/BetPanel'
import { useBalance } from '../store/BalanceContext'
import type { Currency } from '../types'
import { random, shuffle } from '../utils/rng'
import { formatAmount, currencyLabel, roundPayout } from '../utils/format'
import { haptic } from '../telegram'

interface Props {
  onBack: () => void
}

const SIZE = 25
const MINE_OPTIONS = [3, 5, 7, 10]

function multiplierFor(mines: number, revealed: number): number {
  if (revealed <= 0) return 1
  const safe = SIZE - mines
  let mult = 1
  for (let i = 0; i < revealed; i++) {
    mult *= (SIZE - i) / (safe - i)
  }
  return Math.max(1, mult * 0.97)
}

export function Mines({ onBack }: Props) {
  const { balances, placeBet, credit } = useBalance()
  const [currency, setCurrency] = useState<Currency>('stars')
  const [bet, setBet] = useState(25)
  const [minesCount, setMinesCount] = useState(5)
  const [active, setActive] = useState(false)
  const [mineSet, setMineSet] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [boom, setBoom] = useState<number | null>(null)
  const [cashed, setCashed] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const mult = useMemo(
    () => multiplierFor(minesCount, revealed.size),
    [minesCount, revealed.size],
  )
  const payout = roundPayout(bet * mult, currency)

  const resetBoard = () => {
    setMineSet(new Set())
    setRevealed(new Set())
    setBoom(null)
    setCashed(false)
    setMessage(null)
    setActive(false)
  }

  const start = () => {
    if (!placeBet(bet, currency)) {
      setMessage('Недостаточно средств')
      haptic('lose')
      return
    }
    const positions = shuffle([...Array(SIZE).keys()]).slice(0, minesCount)
    setMineSet(new Set(positions))
    setRevealed(new Set())
    setBoom(null)
    setCashed(false)
    setMessage(null)
    setActive(true)
    haptic('tap')
  }

  const reveal = (idx: number) => {
    if (!active || cashed || boom !== null || revealed.has(idx)) return
    if (mineSet.has(idx)) {
      setBoom(idx)
      setActive(false)
      setMessage(`Мина! −${formatAmount(bet, currency)} ${currencyLabel(currency)}`)
      haptic('lose')
      return
    }
    const next = new Set(revealed)
    next.add(idx)
    setRevealed(next)
    haptic('select')
    if (next.size >= SIZE - minesCount) {
      const win = roundPayout(bet * multiplierFor(minesCount, next.size), currency)
      credit(win, currency)
      setCashed(true)
      setActive(false)
      setMessage(`Поле чисто! +${formatAmount(win, currency)} ${currencyLabel(currency)}`)
      haptic('win')
    }
  }

  const cashout = () => {
    if (!active || revealed.size === 0 || boom !== null) return
    credit(payout, currency)
    setCashed(true)
    setActive(false)
    setMessage(`Забрал ×${mult.toFixed(2)} → +${formatAmount(payout, currency)} ${currencyLabel(currency)}`)
    haptic('win')
  }

  const showMines = boom !== null || cashed

  return (
    <GameShell
      title="Мины"
      subtitle="5×5 поле. Открывай безопасные клетки и забирай множитель."
      onBack={onBack}
    >
      <BetPanel
        currency={currency}
        onCurrency={(c) => {
          setCurrency(c)
          setBet(c === 'stars' ? 25 : 0.25)
        }}
        bet={bet}
        onBet={setBet}
        balances={balances}
      />

      <div className="panel">
        <span className="panel-label">Мины на поле</span>
        <div className="bet-row">
          {MINE_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`chip${minesCount === n ? ' active' : ''}`}
              disabled={active}
              onClick={() => setMinesCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="slider-meta" style={{ marginTop: 12 }}>
          <span>
            Множитель: <span className="multiplier">×{mult.toFixed(2)}</span>
          </span>
          <span>
            Выигрыш: {formatAmount(payout, currency)} {currencyLabel(currency)}
          </span>
        </div>
      </div>

      <div className="mines-board">
        {Array.from({ length: SIZE }, (_, i) => {
          const isRevealed = revealed.has(i)
          const isBoom = boom === i
          const isMine = showMines && mineSet.has(i)
          let cls = 'mine-cell'
          if (isBoom) cls += ' boom'
          else if (isRevealed) cls += ' safe'
          else if (isMine) cls += ' hidden-mine'

          return (
            <motion.button
              key={i}
              type="button"
              className={cls}
              disabled={!active || isRevealed || boom !== null}
              onClick={() => reveal(i)}
              whileTap={{ scale: 0.92 }}
            >
              {isBoom ? '💥' : isRevealed ? '💎' : isMine ? '💣' : ''}
            </motion.button>
          )
        })}
      </div>

      {message && (
        <div className={`result-banner ${boom !== null ? 'lose' : 'win'}`}>{message}</div>
      )}

      <div className="actions row">
        {!active && (boom !== null || cashed) ? (
          <button type="button" className="btn btn-primary" onClick={resetBoard} style={{ gridColumn: '1 / -1' }}>
            Новая игра
          </button>
        ) : !active ? (
          <button type="button" className="btn btn-primary" onClick={start} style={{ gridColumn: '1 / -1' }}>
            Поставить
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => reveal(randomSafe(revealed, mineSet))}>
              Случайная
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={cashout}
              disabled={revealed.size === 0}
            >
              Забрать
            </button>
          </>
        )}
      </div>
    </GameShell>
  )
}

function randomSafe(revealed: Set<number>, mines: Set<number>): number {
  const candidates: number[] = []
  for (let i = 0; i < SIZE; i++) {
    if (!revealed.has(i) && !mines.has(i)) candidates.push(i)
  }
  if (candidates.length === 0) {
    for (let i = 0; i < SIZE; i++) if (!revealed.has(i)) return i
    return 0
  }
  return candidates[Math.floor(random() * candidates.length)]
}
