export type Currency = 'stars' | 'ton'

export type Screen =
  | 'home'
  | 'mines'
  | 'coinflip'
  | 'chancer'
  | 'cow'
  | 'cups'
  | 'topup'

export interface Balances {
  stars: number
  ton: number
}

export interface GameMeta {
  id: Exclude<Screen, 'home' | 'topup'>
  title: string
  subtitle: string
  accent: string
}
