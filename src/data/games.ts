import type { GameMeta } from '../types'

export const GAMES: GameMeta[] = [
  {
    id: 'mines',
    title: 'Мины',
    subtitle: 'Открывай клетки. Наткнёшься на мину — всё сгорает.',
    accent: '#e24b5a',
  },
  {
    id: 'coinflip',
    title: 'Орёл и решка',
    subtitle: 'Выбери сторону. Монетка решит всё.',
    accent: '#d4a84b',
  },
  {
    id: 'chancer',
    title: 'Шансер',
    subtitle: 'Крути круг. Чем меньше зелёная зона — тем выше множитель.',
    accent: '#1faa7a',
  },
  {
    id: 'cow',
    title: 'Коровка',
    subtitle: 'Коровка прыгает через люки. Один промах — и ставка пропала.',
    accent: '#7ec8ff',
  },
  {
    id: 'cups',
    title: 'Кружки',
    subtitle: 'Выбери кружку. Приз спрятан только под одной.',
    accent: '#c084fc',
  },
]
