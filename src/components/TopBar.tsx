import { formatAmount } from '../utils/format'
import { useBalance } from '../store/BalanceContext'

export function TopBar() {
  const { balances } = useBalance()

  return (
    <header className="topbar">
      <div className="brand-mark">
        <div className="brand-orb">S</div>
        <div className="brand-text">
          <strong>STELLARIS</strong>
          <span>Stars · TON</span>
        </div>
      </div>
      <div className="balance-pills">
        <div className="pill stars">
          <span className="dot" />
          {formatAmount(balances.stars, 'stars')}
        </div>
        <div className="pill ton">
          <span className="dot" />
          {formatAmount(balances.ton, 'ton')}
        </div>
      </div>
    </header>
  )
}
