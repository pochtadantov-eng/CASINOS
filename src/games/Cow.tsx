import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GameShell } from '../components/GameShell'
import { BetPanel } from '../components/BetPanel'
import { useBalance } from '../store/BalanceContext'
import type { Currency } from '../types'
import { chance } from '../utils/rng'
import { formatAmount, currencyLabel, roundPayout } from '../utils/format'
import { haptic } from '../telegram'

interface Props {
  onBack: () => void
}

const HATCHES = 5
const STEP_MULT = 1.35
const FAIL_BASE = 0.18

export function Cow({ onBack }: Props) {
  const { balances, placeBet, credit } = useBalance()
  const [currency, setCurrency] = useState<Currency>('stars')
  const [bet, setBet] = useState(25)
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [fallen, setFallen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [openHatch, setOpenHatch] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [jumping, setJumping] = useState(false)

  const mult = useMemo(() => Math.pow(STEP_MULT, step), [step])
  const payout = roundPayout(bet * mult, currency)
  const failChance = Math.min(0.55, FAIL_BASE + step * 0.07)

  const resetRound = () => {
    setActive(false)
    setStep(0)
    setFallen(false)
    setFinished(false)
    setOpenHatch(null)
    setMessage(null)
    setJumping(false)
  }

  const start = () => {
    if (!placeBet(bet, currency)) {
      setMessage('Недостаточно средств')
      haptic('lose')
      return
    }
    setActive(true)
    setStep(0)
    setFallen(false)
    setFinished(false)
    setOpenHatch(null)
    setMessage(null)
    haptic('tap')
  }

  const jump = async () => {
    if (!active || jumping || fallen || finished) return
    setJumping(true)
    haptic('select')

    await new Promise((r) => setTimeout(r, 320))

    const fails = chance(failChance)
    if (fails) {
      setOpenHatch(step)
      setFallen(true)
      setActive(false)
      setMessage(`Провалилась! −${formatAmount(bet, currency)} ${currencyLabel(currency)}`)
      haptic('lose')
      setJumping(false)
      return
    }

    const next = step + 1
    setStep(next)
    setJumping(false)

    if (next >= HATCHES) {
      const win = roundPayout(bet * Math.pow(STEP_MULT, next), currency)
      credit(win, currency)
      setFinished(true)
      setActive(false)
      setMessage(`Дошла до конца! +${formatAmount(win, currency)} ${currencyLabel(currency)}`)
      haptic('win')
    }
  }

  const cashout = () => {
    if (!active || step === 0 || fallen) return
    credit(payout, currency)
    setFinished(true)
    setActive(false)
    setMessage(`Забрал ×${mult.toFixed(2)} → +${formatAmount(payout, currency)} ${currencyLabel(currency)}`)
    haptic('win')
  }

  const cowX = 18 + step * 56
  const cowY = fallen ? 120 : jumping ? -28 : 0

  return (
    <GameShell
      title="Коровка"
      subtitle="Прыгай через люки. Риск растёт с каждым шагом."
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

      <div className="cow-stats">
        <div className="stat-box">
          <span>Шаг</span>
          <strong>
            {step}/{HATCHES}
          </strong>
        </div>
        <div className="stat-box">
          <span>Множитель</span>
          <strong className="multiplier">×{mult.toFixed(2)}</strong>
        </div>
        <div className="stat-box">
          <span>Риск падения</span>
          <strong>{Math.round(failChance * 100)}%</strong>
        </div>
        <div className="stat-box">
          <span>Выигрыш сейчас</span>
          <strong>
            {formatAmount(payout, currency)} {currencyLabel(currency)}
          </strong>
        </div>
      </div>

      <div className="cow-track">
        <div className="cow-sky" />
        <div className="cow-road" />
        {Array.from({ length: HATCHES }, (_, i) => (
          <div
            key={i}
            className={`cow-hatch${openHatch === i ? ' open' : ''}`}
            style={{ left: 70 + i * 56 }}
          />
        ))}
        <AnimatePresence>
          <motion.div
            className="cow-character"
            animate={{ x: cowX - 18, y: cowY, opacity: fallen ? 0.35 : 1, rotate: fallen ? 25 : 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            🐄
          </motion.div>
        </AnimatePresence>
      </div>

      {message && (
        <div className={`result-banner ${fallen ? 'lose' : 'win'}`}>{message}</div>
      )}

      <div className="actions row">
        {!active && (fallen || finished) ? (
          <button type="button" className="btn btn-primary" onClick={resetRound} style={{ gridColumn: '1 / -1' }}>
            Новая игра
          </button>
        ) : !active ? (
          <button type="button" className="btn btn-primary" onClick={start} style={{ gridColumn: '1 / -1' }}>
            Поставить
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-ghost" onClick={jump} disabled={jumping}>
              Прыгнуть
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={cashout}
              disabled={step === 0 || jumping}
            >
              Забрать
            </button>
          </>
        )}
      </div>
    </GameShell>
  )
}
