import { useState } from 'react'
import { GameShell } from './GameShell'
import { useBalance } from '../store/BalanceContext'
import type { Currency } from '../types'
import { formatAmount, currencyLabel } from '../utils/format'
import { haptic } from '../telegram'

interface Props {
  onBack: () => void
}

const PACKS: { amount: number; currency: Currency; label: string; hint: string }[] = [
  { amount: 100, currency: 'stars', label: '100 Stars', hint: 'Быстрый старт' },
  { amount: 500, currency: 'stars', label: '500 Stars', hint: 'Популярный пакет' },
  { amount: 1000, currency: 'stars', label: '1000 Stars', hint: 'Для длинных сессий' },
  { amount: 1, currency: 'ton', label: '1 TON', hint: 'Минимум для стола' },
  { amount: 5, currency: 'ton', label: '5 TON', hint: 'Комфортный баланс' },
  { amount: 10, currency: 'ton', label: '10 TON', hint: 'High roller' },
]

export function TopUp({ onBack }: Props) {
  const { topUp, balances } = useBalance()
  const [flash, setFlash] = useState<string | null>(null)

  const buy = (amount: number, currency: Currency) => {
    // Demo top-up. Later: Telegram Stars invoice / TON Connect payment via bot.
    topUp(amount, currency)
    haptic('win')
    setFlash(`+${formatAmount(amount, currency)} ${currencyLabel(currency)} зачислено`)
    window.setTimeout(() => setFlash(null), 1800)
  }

  return (
    <GameShell
      title="Пополнение"
      subtitle="Демо-баланс для теста. Потом подключим оплату Stars и TON."
      onBack={onBack}
    >
      <div className="panel">
        <span className="panel-label">Сейчас на счету</span>
        <div className="balance-pills" style={{ justifyContent: 'flex-start' }}>
          <div className="pill stars">
            <span className="dot" />
            {formatAmount(balances.stars, 'stars')} Stars
          </div>
          <div className="pill ton">
            <span className="dot" />
            {formatAmount(balances.ton, 'ton')} TON
          </div>
        </div>
      </div>

      {flash && <div className="result-banner win">{flash}</div>}

      <div className="topup-grid">
        {PACKS.map((pack) => (
          <button
            key={`${pack.currency}-${pack.amount}`}
            type="button"
            className="topup-card"
            onClick={() => buy(pack.amount, pack.currency)}
          >
            <div>
              <strong>{pack.label}</strong>
              <span>{pack.hint}</span>
            </div>
            <span className="btn btn-ghost" style={{ minHeight: 36, padding: '0 14px' }}>
              Взять
            </span>
          </button>
        ))}
      </div>

      <p className="notice">
        В продакшене Stars пойдут через Telegram Payments (XTR), TON — через TON Connect /
        инвойс бота. Здесь пакеты сразу зачисляют тестовый баланс в мини-аппе.
      </p>
    </GameShell>
  )
}
