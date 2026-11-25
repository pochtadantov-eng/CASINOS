import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  onBack: () => void
  children: ReactNode
}

export function GameShell({ title, subtitle, onBack, children }: Props) {
  return (
    <div className="game-screen">
      <div className="back-row">
        <button type="button" className="back-btn" onClick={onBack} aria-label="Назад">
          ←
        </button>
        <div>
          <h1 className="game-title">{title}</h1>
          <p className="game-sub">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
