import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { appSettingsStore } from './shared/config/appSettings'

// Initialize persisted app settings early (theme, animations, version)
void appSettingsStore.init()

createRoot(document.getElementById('root')!).render(
//  <StrictMode>
    <App />
//  </StrictMode>,
)
