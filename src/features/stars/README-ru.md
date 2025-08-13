# Звёзды Telegram — модальное окно (StarsModal)

Компоненты для экрана «Звёзды Telegram»: главная (баланс/табы), покупка звёзд (грид пакетов), подарки (диалог выбора контакта), анимированная «оранжевая звезда».

## Установка зависимостей

- Framer Motion (анимации):
  - `npm i framer-motion`
- Radix UI (диалог и табы):
  - `npm i @radix-ui/react-dialog @radix-ui/react-tabs`

## Файлы

- `ui/StarsModal.tsx` — корневой компонент модалки с Radix Dialog + Tabs.
- `ui/OrangeStarBurst.tsx` — анимированная звезда с искрами (Framer Motion + CSS/SVG).
- `ui/PurchaseGrid.tsx` — сетка пакетов покупки.
- `ui/HistoryList.tsx` — список операций.
- `ui/GiftDialog.tsx` — вложенный диалог «Подарить звёзды».
- Пример Storybook: `src/stories/StarsModal.stories.tsx`.

## API StarsModal

```tsx
<StarsModal
  open={boolean}
  onClose={() => void}
  balance={{ amount: number }}
  historyApi={{ fetch: (filter: 'all'|'income'|'outcome', page: number) => Promise<OperationPage> }}
  purchaseApi={{ list: () => Promise<StarPackage[]>, buy: (packId: string) => Promise<void> }}
  giftApi={{ searchContacts: (query: string, page: number) => Promise<ContactPage>, startGift: (contactId: string) => Promise<void> }}
/>
```

Типы данных:

```ts
interface Operation { id: string; title: string; subtitle: string; date: string; sign: '+'|'-'; amount: number; avatarUrl?: string }
interface OperationPage { items: Operation[]; nextPage?: number }
interface StarPackage { id: string; qty: number; price: number }
interface Contact { id: string; name: string; subtitle?: string; avatarUrl?: string }
interface ContactPage { items: Contact[]; nextPage?: number }
```

## Поведение и доступность

- Модалка — Radix Dialog: центр по экрану, оверлей `rgba(0,0,0,0.5)` + `backdrop‑blur(2px)`.
- Закрытие: Esc, клик по фону, кнопка «×» (чёрная). Focus trap и возврат фокуса на триггер.
- Табы — Radix Tabs: «Все операции / Зачисления / Списания» с синим индикатором.
- Список — прокручиваемый (для пагинации подключите `historyApi.fetch` по страницам).

## Анимации звезды

- Центральная звезда (SVG) с glow‑фильтром и градиентом (#FFB64D → #FF8A00), блик #FFE1A6.
- Framer Motion: плавный пульс (scale 1.0 ↔ 1.06) и покачивание (−2° ↔ 2°).
- Искры: 24–36 частиц, палитра #FFC46B/#FFD79A/#FFA63D, волнами каждые ~600 мс.
- Производительность: transform/opacity только; ограничение количества частиц.

## Примеры

Storybook (пример):

```tsx
export const Default = () => {
  const [open, setOpen] = useState(true)
  return (
    <StarsModal
      open={open}
      onClose={() => setOpen(false)}
      balance={{ amount: 849 }}
      historyApi={{ fetch: async (filter, page) => ({ items: [], nextPage: 2 }) }}
      purchaseApi={{ list: async () => ([{ id:'p100', qty:100, price:99 }]), buy: async () => {} }}
      giftApi={{ searchContacts: async () => ({ items: [] }), startGift: async () => {} }}
    />
  )
}
```

## Интеграция в меню настроек

Вызов модалки уже подключён к пункту «Telegram Premium» в `src/widgets/settings-panel/ui/SettingsPanel.tsx` через компонент `StarsModal`.

## Тестирование

- Юнит‑тесты: Vitest + RTL — проверить фокус‑trap, Esc/Backdrop закрытие, переключение табов, работу кнопок.
- E2E: Cypress — сценарии открытия/закрытия, переход на покупку/подарку, пагинация истории.

