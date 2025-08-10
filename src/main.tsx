import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { AppSettingsProvider } from './shared/config/AppSettingsProvider'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <AppSettingsProvider>
    <App />
  </AppSettingsProvider>
  // </StrictMode>
)
