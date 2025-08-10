import { Navbar } from './Navbar';
import { observer } from 'mobx-react-lite'
import { natsStore } from '../nats/model'
import { appSettingsStore } from '../config/appSettings'

const StatusDot = observer(() => {
  const m = {
    connected: { bg: 'bg-green-500', text: 'Connected' },
    reconnecting: { bg: 'bg-yellow-500', text: 'Reconnecting' },
    connecting: { bg: 'bg-gray-400', text: 'Connecting' },
    disconnected: { bg: 'bg-red-500', text: 'Disconnected' },
  } as const
  const s = m[natsStore.status]
  return (
    <div className="flex items-center gap-2 text-white/80 text-sm">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.bg}`} />
      <span className="hidden sm:inline">{s.text}</span>
    </div>
  )
})

export const Header = observer(function Header() {
  const version = appSettingsStore.state.version;
  return (
    <header className="w-full flex items-center justify-between px-8 py-5 
      bg-white/15 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="flex items-center gap-3">
        <svg
          width="32"
          height="32"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-purple-400"
        >
          <path d="M32 2L2 18l30 16 30-16-30-16z" />
          <path d="M2 18l30 16 30-16M2 34l30 16 30-16M2 50l30 16 30-16" />
        </svg>
        <span className="text-xl font-bold text-white tracking-tight">
          STEXGQ
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="px-2 py-1 text-xs rounded-md bg-white/10 border border-white/10 text-white/90">
          Версия: <span className="font-semibold">{version}</span>
        </div>
        <StatusDot />
        <Navbar />
      </div>
    </header>
  );
})
