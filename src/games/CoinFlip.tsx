import { useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { GameShell } from '../components/GameShell'
import { BetPanel } from '../components/BetPanel'
import { useBalance } from '../store/BalanceContext'
import type { Currency } from '../types'
import { chance, random } from '../utils/rng'
import { formatAmount, currencyLabel, roundPayout } from '../utils/format'
import { haptic } from '../telegram'

interface Props {
  onBack: () => void
}

type Side = 'heads' | 'tails'

const MULT = 1.95

export function CoinFlip({ onBack }: Props) {
  const { balances, placeBet, credit } = useBalance()
  const [currency, setCurrency] = useState<Currency>('stars')
  const [bet, setBet] = useState(25)
  const [pick, setPick] = useState<Side>('heads')
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Side | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const controls = useAnimationControls()

  const play = async () => {
    if (spinning) return
    if (!placeBet(bet, currency)) {
      setMessage('Недостаточно средств')
      haptic('lose')
      return
    }

    setSpinning(true)
    setMessage(null)
    setResult(null)
    haptic('tap')

    const outcome: Side = chance(0.5) ? 'heads' : 'tails'
    const base = outcome === 'heads' ? 0 : 180
    const spins = 6 + Math.floor(random() * 3)

    await controls.start({
      rotateY: 360 * spins + base,
      transition: { duration: 1.6, ease: [0.2, 0.8, 0.2, 1] },
    })

    setResult(outcome)
    if (outcome === pick) {
      const win = roundPayout(bet * MULT, currency)
      credit(win, currency)
      setMessage(`Выигрыш! +${formatAmount(win, currency)} ${currencyLabel(currency)}`)
      haptic('win')
    } else {
      setMessage(`Проигрыш −${formatAmount(bet, currency)} ${currencyLabel(currency)}`)
      haptic('lose')
    }
    setSpinning(false)
  }

  return (
    <GameShell
      title="Орёл и решка"
      subtitle={`Выбери сторону. Множитель ×${MULT} при угадывании.`}
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
        <span className="panel-label">Твой выбор</span>
        <div className="choice-row">
          <button
            type="button"
            className={`choice-btn${pick === 'heads' ? ' active' : ''}`}
            disabled={spinning}
            onClick={() => setPick('heads')}
          >
            Орёл
          </button>
          <button
            type="button"
            className={`choice-btn${pick === 'tails' ? ' active' : ''}`}
            disabled={spinning}
            onClick={() => setPick('tails')}
          >
            Решка
          </button>
        </div>
      </div>

      <div className="coin-stage">
        <motion.div
          className="coin"
          animate={controls}
          initial={{ rotateY: 0 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="coin-face heads">О</div>
          <div className="coin-face tails">Р</div>
        </motion.div>
      </div>

      {message && (
        <div className={`result-banner ${result === pick ? 'win' : 'lose'}`}>
          {result ? `${result === 'heads' ? 'Выпал орёл' : 'Выпала решка'}. ` : ''}
          {message}
        </div>
      )}

      <button type="button" className="btn btn-primary" onClick={play} disabled={spinning}>
        {spinning ? 'Крутим…' : 'Бросить монету'}
      </button>
    </GameShell>
  )
}
