import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TopBar } from './components/TopBar'
import { HomeMenu } from './components/HomeMenu'
import { TopUp } from './components/TopUp'
import { Mines } from './games/Mines'
import { CoinFlip } from './games/CoinFlip'
import { Chancer } from './games/Chancer'
import { Cow } from './games/Cow'
import { Cups } from './games/Cups'
import { BalanceProvider } from './store/BalanceContext'
import { getWebApp, initTelegram } from './telegram'
import type { Screen } from './types'
function Router() {
  const [screen, setScreen] = useState<Screen>('home')

  const goHome = useCallback(() => setScreen('home'), [])

  useEffect(() => {
    const wa = getWebApp()
    if (!wa?.BackButton) return

    const onBack = () => setScreen('home')
    if (screen === 'home') {
      wa.BackButton.hide()
      wa.BackButton.offClick(onBack)
    } else {
      wa.BackButton.show()
      wa.BackButton.onClick(onBack)
    }
    return () => {
      wa.BackButton?.offClick(onBack)
      wa.BackButton?.hide()
    }
  }, [screen])

  return (
    <div className="app-shell">
      <TopBar />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          {screen === 'home' && <HomeMenu onOpen={setScreen} />}
          {screen === 'topup' && <TopUp onBack={goHome} />}
          {screen === 'mines' && <Mines onBack={goHome} />}
          {screen === 'coinflip' && <CoinFlip onBack={goHome} />}
          {screen === 'chancer' && <Chancer onBack={goHome} />}
          {screen === 'cow' && <Cow onBack={goHome} />}
          {screen === 'cups' && <Cups onBack={goHome} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    initTelegram()
  }, [])

  return (
    <BalanceProvider>
      <Router />
    </BalanceProvider>
  )
}
