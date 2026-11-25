import type { Currency } from '../types'
import { currencyLabel, formatAmount } from '../utils/format'

const STAR_CHIPS = [10, 25, 50, 100, 250]
const TON_CHIPS = [0.1, 0.25, 0.5, 1, 2]

interface Props {
  currency: Currency
  onCurrency: (c: Currency) => void
  bet: number
  onBet: (n: number) => void
  balances: { stars: number; ton: number }
}

export function BetPanel({ currency, onCurrency, bet, onBet, balances }: Props) {
  const chips = currency === 'stars' ? STAR_CHIPS : TON_CHIPS

  return (
    <div className="panel">
      <span className="panel-label">Ставка</span>
      <div className="currency-switch">
        <button
          type="button"
          className={`stars${currency === 'stars' ? ' active' : ''}`}
          onClick={() => onCurrency('stars')}
        >
          ⭐ Stars · {formatAmount(balances.stars, 'stars')}
        </button>
        <button
          type="button"
          className={`ton${currency === 'ton' ? ' active' : ''}`}
          onClick={() => onCurrency('ton')}
        >
          TON · {formatAmount(balances.ton, 'ton')}
        </button>
      </div>
      <div className="bet-row">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip${bet === c ? ' active' : ''}`}
            onClick={() => onBet(c)}
          >
            {formatAmount(c, currency)} {currencyLabel(currency)}
          </button>
        ))}
      </div>
      <div className="bet-custom">
        <input
          type="number"
          min={currency === 'stars' ? 1 : 0.01}
          step={currency === 'stars' ? 1 : 0.01}
          value={bet}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (!Number.isFinite(v) || v < 0) return
            onBet(currency === 'stars' ? Math.round(v) : Math.round(v * 100) / 100)
          }}
        />
      </div>
    </div>
  )
}
