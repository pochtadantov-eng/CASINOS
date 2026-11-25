import type { Currency } from '../types'

export function formatAmount(value: number, currency: Currency): string {
  if (currency === 'ton') {
    return value.toLocaleString('ru-RU', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })
  }
  return Math.round(value).toLocaleString('ru-RU')
}

export function currencyLabel(currency: Currency): string {
  return currency === 'stars' ? '⭐' : 'TON'
}

export function roundPayout(value: number, currency: Currency): number {
  if (currency === 'stars') return Math.max(0, Math.round(value))
  return Math.max(0, Math.round(value * 100) / 100)
}
