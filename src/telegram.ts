type TelegramWebApp = {
  ready: () => void
  expand: () => void
  enableClosingConfirmation?: () => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  themeParams?: Record<string, string>
  colorScheme?: 'light' | 'dark'
  initDataUnsafe?: { user?: { first_name?: string; username?: string } }
  MainButton?: {
    text: string
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
  }
  BackButton?: {
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
  }
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function getWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null
}

export function initTelegram(): void {
  const wa = getWebApp()
  if (!wa) return
  wa.ready()
  wa.expand()
  wa.setHeaderColor?.('#06141f')
  wa.setBackgroundColor?.('#06141f')
  wa.enableClosingConfirmation?.()
}

export function haptic(
  kind: 'tap' | 'win' | 'lose' | 'select' = 'tap',
): void {
  const h = getWebApp()?.HapticFeedback
  if (!h) return
  try {
    if (kind === 'win') h.notificationOccurred('success')
    else if (kind === 'lose') h.notificationOccurred('error')
    else if (kind === 'select') h.selectionChanged()
    else h.impactOccurred('light')
  } catch {
    /* ignore outside Telegram */
  }
}

export function userDisplayName(): string {
  const user = getWebApp()?.initDataUnsafe?.user
  if (!user) return 'Игрок'
  return user.first_name || user.username || 'Игрок'
}
