import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { AppSettingsProvider } from './shared/config/AppSettingsProvider'
import { initializeEmojiPicker } from './emoji'
import { defaultDecoderConfig } from './emoji/nativeDecoders'

// Защита от повторной инициализации
if (!(window as any).__emojiPickerInitialized) {
  (window as any).__emojiPickerInitialized = true;
  
  // Инициализируем EmojiPicker с настройками по умолчанию
  initializeEmojiPicker({
    autoLoadDecoders: true,
    preloadLottieFiles: true,
    enableOffscreenCanvas: true,
    enableWasmDecoder: true,
    logLevel: 'info',
    decoders: defaultDecoderConfig
  }).catch(console.error);
}

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <AppSettingsProvider>
    <App />
  </AppSettingsProvider>
  // </StrictMode>
)
