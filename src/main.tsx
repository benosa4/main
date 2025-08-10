import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { appSettingsStore } from './shared/config/appSettings'

async function bootstrap() {
  // Load persisted app settings BEFORE first paint
  try { await appSettingsStore.init(); } catch {}
  createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <App />
    // </StrictMode>
  )
}

void bootstrap()
