import { motion } from 'framer-motion'
import { GAMES } from '../data/games'
import type { Screen } from '../types'
import { userDisplayName } from '../telegram'

interface Props {
  onOpen: (screen: Screen) => void
}

const ICONS: Record<string, string> = {
  mines: '💣',
  coinflip: '🪙',
  chancer: '🎯',
  cow: '🐄',
  cups: '🥤',
}

export function HomeMenu({ onOpen }: Props) {
  const name = userDisplayName()

  return (
    <div>
      <section className="hero">
        <div className="hero-visual" aria-hidden />
        <div className="hero-orbit" aria-hidden />
        <div className="hero-content">
          <motion.div
            className="hero-brand"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            STELLARIS
          </motion.div>
          <motion.p
            className="hero-line"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
          >
            Привет, {name}. Игры на Telegram Stars и TON — выбирай стол.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.45 }}
          >
            <button type="button" className="btn btn-primary" onClick={() => onOpen('topup')}>
              Пополнить
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onOpen('mines')}
            >
              Играть
            </button>
          </motion.div>
        </div>
      </section>

      <div className="section-head">
        <h2>Игры</h2>
        <span>5 режимов</span>
      </div>

      <div className="game-grid">
        {GAMES.map((game, i) => (
          <motion.button
            key={game.id}
            type="button"
            className="game-tile"
            style={{ ['--tile-accent' as string]: game.accent }}
            onClick={() => onOpen(game.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="tile-icon">{ICONS[game.id]}</div>
            <h3>{game.title}</h3>
            <p>{game.subtitle}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
