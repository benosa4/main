# Telegram Premium — модальное окно

Компонент модалки Premium с анимированной фиолетовой звездой, выбором тарифов (12 мес/1 мес) и CTA.

## Зависимости

- Radix UI Dialog: `npm i @radix-ui/react-dialog`
- Framer Motion (анимации): `npm i framer-motion`

## Файлы

- `ui/PremiumModal.tsx` — корневой компонент (Radix Dialog + фокус‑trap, закрытие только по «×» или успешному сабмиту).
- `ui/StarBurst.tsx` — анимированная фиолетовая звезда (Framer Motion + SVG glow + частицы).

## API

```tsx
<PremiumModal
  open={boolean}
  onClose={() => void}                  // закрывает модалку (крестик)
  onSubmit={(plan) => Promise<void>}    // сабмит покупки, модалка закрывается снаружи по resolve
  defaultPlan?: 'annual' | 'monthly'
  prices?: {
    annual: { total: number; monthly: number; discountLabel?: string }
    monthly: { total: number; monthly: number }
  }
/>
```

## Поведение

- Центр по экрану, оверлей `rgba(0,0,0,0.5)`.
- Закрытие по фону и Esc — отключено (по требованиям); доступно только «×» и успешная покупка.
- Кнопка «×» — чёрная, имеет hover/focus‑состояния.

## Пример

```tsx
const [open, setOpen] = useState(true)
<PremiumModal
  open={open}
  onClose={() => setOpen(false)}
  onSubmit={async (plan)=>{ await api.buy(plan); setOpen(false) }}
/>
```

