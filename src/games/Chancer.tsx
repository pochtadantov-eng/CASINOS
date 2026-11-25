import { useMemo, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { GameShell } from '../components/GameShell'
import { BetPanel } from '../components/BetPanel'
import { useBalance } from '../store/BalanceContext'
import type { Currency } from '../types'
import { random } from '../utils/rng'
import { formatAmount, currencyLabel, roundPayout } from '../utils/format'
import { haptic } from '../telegram'

interface Props {
  onBack: () => void
}

const HOUSE = 0.96

export function Chancer({ onBack }: Props) {
  const { balances, placeBet, credit } = useBalance()
  const [currency, setCurrency] = useState<Currency>('stars')
  const [bet, setBet] = useState(25)
  const [chancePct, setChancePct] = useState(35)
  const [spinning, setSpinning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const controls = useAnimationControls()

  const mult = useMemo(() => {
    const p = Math.max(5, Math.min(90, chancePct)) / 100
    return Math.max(1.05, (1 / p) * HOUSE)
  }, [chancePct])

  const wheelStyle = useMemo(() => {
    const green = Math.max(5, Math.min(90, chancePct))
    return {
      background: `conic-gradient(from -90deg, #1faa7a 0 ${green}%, #1a2430 ${green}% 100%)`,
    }
  }, [chancePct])

  const play = async () => {
    if (spinning) return
    if (!placeBet(bet, currency)) {
      setMessage('Недостаточно средств')
      setWon(false)
      haptic('lose')
      return
    }

    setSpinning(true)
    setMessage(null)
    setWon(null)
    haptic('tap')

    const p = chancePct / 100
    const roll = random()
    const hit = roll < p
    // Marker at top (−90deg of conic). Green zone is first `chancePct` from -90deg.
    // Final absolute angle such that pointer samples `roll * 360` into the wheel.
    const targetAngle = roll * 360
    const spins = 4 + Math.floor(random() * 3)
    const final = spins * 360 + (360 - targetAngle)

    await controls.start({
      rotate: final,
      transition: { duration: 2.2, ease: [0.15, 0.85, 0.2, 1] },
    })

    if (hit) {
      const win = roundPayout(bet * mult, currency)
      credit(win, currency)
      setWon(true)
      setMessage(`В зоне! ×${mult.toFixed(2)} → +${formatAmount(win, currency)} ${currencyLabel(currency)}`)
      haptic('win')
    } else {
      setWon(false)
      setMessage(`Мимо. −${formatAmount(bet, currency)} ${currencyLabel(currency)}`)
      haptic('lose')
    }
    setSpinning(false)
  }

  return (
    <GameShell
      title="Шансер"
      subtitle="Настрой зелёную зону. Меньше зона — больше множитель."
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
        <span className="panel-label">Зелёная зона</span>
        <div className="slider-row">
          <input
            type="range"
            min={5}
            max={90}
            step={1}
            value={chancePct}
            disabled={spinning}
            onChange={(e) => setChancePct(Number(e.target.value))}
          />
          <div className="slider-meta">
            <span>Шанс {chancePct}%</span>
            <span>
              Множитель <span className="multiplier">×{mult.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="chancer-wheel-wrap">
        <div className="chancer-marker" />
        <motion.div
          className="chancer-wheel"
          style={wheelStyle}
          animate={controls}
          initial={{ rotate: 0 }}
        >
          <div className="chancer-hub" />
        </motion.div>
      </div>

      {message && (
        <div className={`result-banner ${won ? 'win' : 'lose'}`}>{message}</div>
      )}

      <button type="button" className="btn btn-primary" onClick={play} disabled={spinning}>
        {spinning ? 'Крутится…' : 'Крутить'}
      </button>
    </GameShell>
  )
}
