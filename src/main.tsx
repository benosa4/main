import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App'
import { AppSettingsProvider } from './shared/config/AppSettingsProvider'
import { initializeEmojiPicker } from './emoji'
import { defaultDecoderConfig } from './emoji/nativeDecoders'

declare global {
  interface Window {
    __emojiPickerInitialized?: boolean;
  }
}

const start = async () => {
  if (!window.__emojiPickerInitialized) {
    window.__emojiPickerInitialized = true;
    await initializeEmojiPicker({
      autoLoadDecoders: true,
      preloadLottieFiles: true,
      enableOffscreenCanvas: true,
      enableWasmDecoder: true,
      logLevel: 'info',
      decoders: defaultDecoderConfig
    });
  }

  createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <AppSettingsProvider>
      <App />
    </AppSettingsProvider>
    // </StrictMode>
  )
}

start().catch(console.error)
