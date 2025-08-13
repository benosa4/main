import * as React from 'react'
import * as Dropdown from '@radix-ui/react-dropdown-menu'
import { Pencil, Video, BellOff, CheckSquare, Gift, ShieldBan, Trash2, Check } from 'lucide-react'
import appSettingsStore from '../../config/appSettings'
import { applyTheme, ThemeChoice } from '../../theme/ThemeManager'

export type KebabAction =
  | 'edit'
  | 'video-call'
  | 'mute'
  | 'select-messages'
  | 'send-gift'
  | 'block'
  | 'delete-chat'

export interface KebabMenuProps {
  onAction?: (action: KebabAction) => void
  disabledActions?: Partial<Record<KebabAction, boolean>>
  ariaLabel?: string
}

export function KebabMenu({ onAction, disabledActions, ariaLabel = 'Больше' }: KebabMenuProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={ariaLabel}
          className="icon-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="5" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="19" r="2" fill="currentColor" />
          </svg>
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={8}
          className="z-[60] min-w-[200px] w-[min(280px,92vw)] p-[6px] rounded-2xl bg-white/90 backdrop-blur-[2px] border border-[#CFE3F3] shadow-[0_8px_30px_rgba(0,0,0,0.12)] data-[state=open]:animate-dropdown-in data-[state=closed]:animate-dropdown-out"
          style={{ backgroundImage: 'linear-gradient(180deg,#EAF6FF 0%, #E3F0FB 100%)' }}
        >
          <div className="max-h-[60vh] overflow-y-auto rounded-2xl">
            <MenuItem icon={<Pencil size={20} className="text-[#5B7088]" />} label="Изменить" onSelect={() => onAction?.('edit')} />
            <MenuItem icon={<Video size={20} className="text-[#5B7088]" />} label="Видеозвонок" onSelect={() => onAction?.('video-call')} disabled={!!disabledActions?.['video-call']} />
            <MenuItem icon={<BellOff size={20} className="text-[#5B7088]" />} label="Убрать звук…" onSelect={() => onAction?.('mute')} disabled={!!disabledActions?.['mute']} />
            <MenuItem icon={<CheckSquare size={20} className="text-[#5B7088]" />} label="Выберите сообщения" onSelect={() => onAction?.('select-messages')} />
            <MenuItem icon={<Gift size={20} className="text-[#5B7088]" />} label="Отправить подарок" onSelect={() => onAction?.('send-gift')} />
            <MenuItem icon={<ShieldBan size={20} className="text-[#5B7088]" />} label="Заблокировать" onSelect={() => onAction?.('block')} disabled={!!disabledActions?.['block']} />
            <Separator />
            <MenuItem
              icon={<Trash2 size={20} className="text-[#EF4444]" />}
              label="Удалить чат"
              danger
              onSelect={() => onAction?.('delete-chat')}
              disabled={!!disabledActions?.['delete-chat']}
            />
            <Separator />
            <Dropdown.Sub>
              <Dropdown.SubTrigger
                className="group flex items-center gap-[10px] h-10 px-3 py-2 rounded-xl cursor-pointer outline-none select-none text-[#0F172A] hover:bg-[#EAF2FE] active:bg-[#dbeafe] focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                Тема
              </Dropdown.SubTrigger>
              <Dropdown.Portal>
                <Dropdown.SubContent
                  alignOffset={-4}
                  sideOffset={8}
                  className="min-w-[160px] p-[6px] rounded-2xl bg-white/90 backdrop-blur-[2px] border border-[#CFE3F3] shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                >
                  <Dropdown.RadioGroup
                    value={appSettingsStore.state.theme === 'auto' ? 'system' : appSettingsStore.state.theme}
                    onValueChange={(v) => applyTheme(v as ThemeChoice)}
                  >
                    <ThemeOption value="light" label="Light" />
                    <ThemeOption value="dark" label="Dark" />
                    <ThemeOption value="system" label="System" />
                  </Dropdown.RadioGroup>
                </Dropdown.SubContent>
              </Dropdown.Portal>
            </Dropdown.Sub>
          </div>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}

function Separator() {
  return <div className="my-[6px] h-px bg-[#E6EDF6]" role="separator" />
}

function MenuItem({ icon, label, onSelect, disabled, danger }: { icon: React.ReactNode; label: string; onSelect: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <Dropdown.Item
      disabled={disabled}
      className={[
        'group flex items-center gap-[10px] h-10 px-3 py-2 rounded-xl cursor-pointer outline-none select-none',
        'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
        danger
          ? 'text-[#DC2626] hover:bg-[#FEE2E2] active:bg-[#fecaca] focus-visible:ring-2 focus-visible:ring-sky-500'
          : 'text-[#0F172A] hover:bg-[#EAF2FE] active:bg-[#dbeafe] focus-visible:ring-2 focus-visible:ring-sky-500',
      ].join(' ')}
      onSelect={(e) => {
        e.preventDefault()
        if (!disabled) onSelect()
      }}
      title={label}
      role="menuitem"
    >
      <span className={danger ? 'text-[#EF4444]' : 'text-[#5B7088]'}>{icon}</span>
      <span className="text-[14px] truncate">{label}</span>
    </Dropdown.Item>
  )
}

function ThemeOption({ value, label }: { value: ThemeChoice; label: string }) {
  return (
    <Dropdown.RadioItem
      value={value}
      className="group flex items-center gap-2 h-8 px-3 rounded-lg cursor-pointer outline-none select-none text-[#0F172A] data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed hover:bg-[#EAF2FE] active:bg-[#dbeafe] focus-visible:ring-2 focus-visible:ring-sky-500"
    >
      <Dropdown.ItemIndicator>
        <Check size={16} />
      </Dropdown.ItemIndicator>
      <span className="text-[14px] truncate">{label}</span>
    </Dropdown.RadioItem>
  )
}

export default KebabMenu

