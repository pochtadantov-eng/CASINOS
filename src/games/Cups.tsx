import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { GameShell } from '../components/GameShell'
import { BetPanel } from '../components/BetPanel'
import { useBalance } from '../store/BalanceContext'
import type { Currency } from '../types'
import { shuffle } from '../utils/rng'
import { formatAmount, currencyLabel, roundPayout } from '../utils/format'
import { haptic } from '../telegram'

interface Props {
  onBack: () => void
}

const CUP_OPTIONS = [3, 4, 5]
const HOUSE = 0.94

export function Cups({ onBack }: Props) {
  const { balances, placeBet, credit } = useBalance()
  const [currency, setCurrency] = useState<Currency>('stars')
  const [bet, setBet] = useState(25)
  const [cupCount, setCupCount] = useState(3)
  const [selected, setSelected] = useState<number | null>(null)
  const [winner, setWinner] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const winChance = 1 / cupCount
  const mult = useMemo(() => (1 / winChance) * HOUSE, [winChance])

  const play = async () => {
    if (busy || selected === null) return
    if (!placeBet(bet, currency)) {
      setMessage('Недостаточно средств')
      haptic('lose')
      return
    }

    setBusy(true)
    setRevealed(false)
    setWinner(null)
    setMessage(null)
    haptic('tap')

    await new Promise((r) => setTimeout(r, 700))

    const prizeAt = shuffle([...Array(cupCount).keys()])[0]
    setWinner(prizeAt)
    setRevealed(true)

    if (prizeAt === selected) {
      const win = roundPayout(bet * mult, currency)
      credit(win, currency)
      setMessage(`Угадал! ×${mult.toFixed(2)} → +${formatAmount(win, currency)} ${currencyLabel(currency)}`)
      haptic('win')
    } else {
      setMessage(`Пусто. Приз был под кружкой ${prizeAt + 1}`)
      haptic('lose')
    }
    setBusy(false)
  }

  const resetPick = () => {
    setSelected(null)
    setWinner(null)
    setRevealed(false)
    setMessage(null)
  }

  return (
    <GameShell
      title="Кружки"
      subtitle="Приз под одной кружкой. Больше кружек — выше множитель."
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
        <span className="panel-label">Сколько кружек</span>
        <div className="bet-row">
          {CUP_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`chip${cupCount === n ? ' active' : ''}`}
              disabled={busy}
              onClick={() => {
                setCupCount(n)
                resetPick()
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="slider-meta" style={{ marginTop: 12 }}>
          <span>Шанс ≈ {Math.round(winChance * 100)}%</span>
          <span>
            Множитель <span className="multiplier">×{mult.toFixed(2)}</span>
          </span>
        </div>
      </div>

      <div className="cups-row" style={{ gridTemplateColumns: `repeat(${cupCount}, 1fr)` }}>
        {Array.from({ length: cupCount }, (_, i) => {
          let cls = 'cup'
          if (selected === i) cls += ' selected'
          if (revealed && winner === i) cls += ' win'
          if (revealed && winner !== i && selected === i) cls += ' lose'

          return (
            <motion.button
              key={`${cupCount}-${i}`}
              type="button"
              className={cls}
              disabled={busy}
              onClick={() => {
                if (busy) return
                setSelected(i)
                setRevealed(false)
                setWinner(null)
                setMessage(null)
                haptic('select')
              }}
              whileTap={{ y: 4 }}
              animate={busy && !revealed ? { y: [0, -8, 0] } : { y: 0 }}
              transition={{ duration: 0.45, repeat: busy && !revealed ? 1 : 0 }}
            >
              <div className="cup-lid" />
              <div className="cup-body" />
              <span>
                {revealed && winner === i ? '⭐' : `#${i + 1}`}
              </span>
            </motion.button>
          )
        })}
      </div>

      {message && (
        <div className={`result-banner ${winner === selected ? 'win' : 'lose'}`}>{message}</div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        onClick={play}
        disabled={busy || selected === null}
      >
        {busy ? 'Перемешиваем…' : revealed ? 'Сыграть ещё' : 'Открыть'}
      </button>
    </GameShell>
  )
}
