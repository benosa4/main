import { observer } from 'mobx-react-lite';
import { settingsPanelStore } from '../../../features/settings-panel/model';
import { profileStore } from '../../../features/profile/model';
import { useEffect, useRef, useState } from 'react';
import { presignForUpload, uploadToPresignedUrl } from '../../../shared/media/api';
import appSettingsStore from '../../../shared/config/appSettings';
import { downloadFromUrl } from '../../../shared/media/api';

const NavBar = observer(() => {
  const current = settingsPanelStore.stack[settingsPanelStore.stack.length - 1] || 'root';
  const title = current === 'root' ? 'Настройки' :
    current === 'general' ? 'Общие настройки' :
    current === 'wallpapers' ? 'Обои для чатов' :
    current === 'setColor' ? 'Задать цвет' :
    current === 'animation' ? 'Анимация и скорость' :
    current === 'notifications' ? 'Уведомления' :
    current === 'data' ? 'Данные и память' :
    current === 'privacy' ? 'Конфиденциальность' :
    current === 'folders' ? 'Папки с чатами' :
    current === 'sessions' ? 'Активные сеансы' :
    current === 'language' ? 'Язык' :
    current === 'stickers' ? 'Стикеры и эмодзи' : 'Настройки';
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white/20 border-b border-white/20">
      <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center" onClick={() => settingsPanelStore.back()} aria-label="Back">←</button>
      <div className="font-semibold">{title}</div>
      <div className="ml-auto flex items-center gap-2">
        {current === 'root' && (
          <>
            <AvatarEditButton />
            <MenuDots />
          </>
        )}
      </div>
    </div>
  );
});

const AvatarEditButton = observer(() => {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const { uploadUrl, fileUrl, headers } = await presignForUpload({ filename: f.name, mime: f.type });
        await uploadToPresignedUrl(uploadUrl, f, headers);
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = (reader.result as string) || '';
          profileStore.setAvatar({ remoteUrl: fileUrl, cacheDataUrl: dataUrl });
        };
        reader.readAsDataURL(f);
        e.currentTarget.value = '';
      }} />
      <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center" onClick={() => fileRef.current?.click()} aria-label="Edit avatar">✏️</button>
    </>
  );
});

const MenuDots = () => (
  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center" title="Выход">⋮</div>
);

const ProfileTop = observer(() => {
  const p = profileStore.profile;
  return (
    <div className="px-3 pt-3">
      <div className="w-full aspect-square rounded-md bg-gray-500/40 overflow-hidden flex items-center justify-center">
        {p?.avatarCacheDataUrl ? (
          <img src={p.avatarCacheDataUrl as string} className="w-full h-full object-cover" />
        ) : p?.avatarUrl ? (
          <img src={p.avatarUrl} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/60">Нет аватара</div>
        )}
      </div>
      <div className="mt-2">
        <div className="font-semibold">{p?.displayName || ''}</div>
        <div className="text-sm text-white/70">был(а) недавно</div>
      </div>
    </div>
  );
});

const Row = ({ left, title, subtitle }: { left: React.ReactNode; title: string; subtitle: string }) => (
  <div className="flex items-start gap-3 px-3 py-3">
    <div className="w-8 h-8 flex items-center justify-center">{left}</div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold truncate">{title}</div>
      <div className="text-sm text-white/70 truncate">{subtitle}</div>
    </div>
  </div>
);

const RootScreen = observer(() => {
  const p = profileStore.profile;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom pb-4">
      <ProfileTop />
      <div className="mt-3">
        <Row left={<span>📞</span>} title={p?.phone || ''} subtitle="Телефон" />
        <Row left={<span>🐶</span>} title={p?.username || ''} subtitle="Имя пользователя" />
        <Row left={<span>❗</span>} title={p?.about || ''} subtitle="О себе" />
        <Row left={<span>📅</span>} title={p?.birthdayLabel || ''} subtitle="Дата рождения" />
      </div>
      <div className="h-px bg-white/20 mx-3 my-2" />
      <div>
        <MenuItem icon="⚙️" label="Общие настройки" onClick={() => settingsPanelStore.push('general')} />
        <MenuItem icon="🛰️" label="Анимация и скорость" onClick={() => settingsPanelStore.push('animation')} />
        <MenuItem icon="🔔" label="Уведомления" onClick={() => settingsPanelStore.push('notifications')} />
        <MenuItem icon="💾" label="Данные и память" onClick={() => settingsPanelStore.push('data')} />
        <MenuItem icon="🔒" label="Конфиденциальность" onClick={() => settingsPanelStore.push('privacy')} />
        <MenuItem icon="📁" label="Папки с чатами" onClick={() => settingsPanelStore.push('folders')} />
        <MenuItem icon="🖥️" label="Активные сеансы" right="1" onClick={() => settingsPanelStore.push('sessions')} />
        <MenuItem icon="🌐" label="Язык" right="Русский" onClick={() => settingsPanelStore.push('language')} />
        <MenuItem icon="😊" label="Стикеры и эмодзи" onClick={() => settingsPanelStore.push('stickers')} />
      </div>
      <div className="h-px bg-white/20 mx-3 my-2" />
      <div>
        <MenuItem icon="⭐" label="Telegram Premium" onClick={() => alert('Telegram Premium')} highlight />
        <MenuItem icon="🌟" label="Мои звезды" right="0" onClick={() => alert('Мои звезды')} />
        <MenuItem icon="TON" label="My TON" right="0" onClick={() => alert('My TON')} />
        <MenuItem icon="🎁" label="Отправить подарок" onClick={() => alert('Отправить подарок')} />
      </div>
      <div className="h-px bg-white/20 mx-3 my-2" />
      <div>
        <MenuItem icon="💬" label="Задать вопрос" onClick={() => alert('Задать вопрос')} />
        <a className="flex items-center gap-3 px-3 py-3 text-white/90 hover:bg-white/10" href="#" target="_blank" rel="noreferrer">
          <span>❓</span>
          <span className="flex-1">Вопросы о Telegram</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-3 text-white/90 hover:bg-white/10" href="#" target="_blank" rel="noreferrer">
          <span>🛡️</span>
          <span className="flex-1">Политика конфиденциальности</span>
        </a>
      </div>
    </div>
  );
});

const MenuItem = ({ icon, label, right, onClick, highlight }: { icon: string; label: string; right?: string; onClick?: () => void; highlight?: boolean }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-white/10 ${highlight ? 'text-purple-300' : ''}`}>
    <span>{icon}</span>
    <span className="flex-1">{label}</span>
    {right ? <span className="text-white/70">{right}</span> : null}
  </button>
);

const ScreenPlaceholder = ({ title }: { title: string }) => (
  <div className="flex-1 overflow-y-auto scrollbar-custom p-3">{title}</div>
);

const Screens = observer(() => {
  const stack = settingsPanelStore.stack;
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="h-full flex" style={{ width: `${stack.length * 100}%`, transform: `translateX(-${(stack.length - 1) * 100}%)`, transition: 'transform 420ms ease' }}>
        {stack.map((s, idx) => (
          <div key={idx} className="w-full flex-shrink-0 flex flex-col">
            <NavBar />
            {s === 'root' && <RootScreen />}
            {s === 'general' && <GeneralScreen />}
            {s === 'wallpapers' && <WallpapersScreen />}
            {s === 'setColor' && <SetColorScreen />}
            {s === 'animation' && <ScreenPlaceholder title="Экран: Анимация и скорость" />}
            {s === 'notifications' && <ScreenPlaceholder title="Экран: Уведомления" />}
            {s === 'data' && <ScreenPlaceholder title="Экран: Данные и память" />}
            {s === 'privacy' && <ScreenPlaceholder title="Экран: Конфиденциальность" />}
            {s === 'folders' && <ScreenPlaceholder title="Экран: Папки с чатами" />}
            {s === 'sessions' && <ScreenPlaceholder title="Экран: Активные сеансы" />}
            {s === 'language' && <ScreenPlaceholder title="Экран: Язык" />}
            {s === 'stickers' && <ScreenPlaceholder title="Экран: Стикеры и эмодзи" />}
          </div>
        ))}
      </div>
    </div>
  );
});

const SettingsPanel = observer(() => {
  const open = settingsPanelStore.open;               // всегда читаем стор
  const [slideIn, setSlideIn] = useState(false);      // всегда объявляем хуки

  useEffect(() => {
    if (open) {
      setSlideIn(false);
      const t = requestAnimationFrame(() => setSlideIn(true));
      return () => cancelAnimationFrame(t);
    } else {
      // при закрытии мгновенно уберём слайд-ин, чтобы при следующем открытии анимация отработала снова
      setSlideIn(false);
    }
  }, [open]);

  // теперь можно условно ничего не рендерить — порядок хуков сохранён
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-30">
      <div
        className="absolute top-0 right-0 bottom-0 left-0 bg-black border-l border-white/20 will-change-transform flex flex-col"
        style={{
          transform: slideIn ? 'translateX(0%)' : 'translateX(100%)',
          transition: 'transform 420ms ease',
        }}
      >
        <Screens />
      </div>
    </div>
  );
});

export default SettingsPanel;

// GENERAL SCREEN IMPLEMENTATION
const GeneralScreen = observer(() => {
  const s = appSettingsStore.state;
  const [textSize, setTextSize] = useState<number>(s.textSize);
  useEffect(() => setTextSize(s.textSize), [s.textSize]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3">
      <div className="max-w-[640px] mx-auto space-y-3">
      {/* Text Size */}
      <div className="bg-white/10 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Настройки текста</div>
          <div className="text-white/70">{textSize}px</div>
        </div>
        <input
          type="range"
          min={12}
          max={24}
          step={1}
          value={textSize}
          onChange={(e) => setTextSize(parseInt(e.target.value, 10))}
          onMouseUp={() => appSettingsStore.setTextSize(textSize)}
          onTouchEnd={() => appSettingsStore.setTextSize(textSize)}
          className="w-full mt-2"
        />
      </div>

      {/* Wallpapers & color */}
      <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg" onClick={() => settingsPanelStore.push('wallpapers')}>
        <div className="w-24 h-16 rounded-md overflow-hidden bg-white/10 flex items-center justify-center">
          {s.chatWallpaperUrl ? (
            <img src={(s.chatWallpaperGallery.find(g => g.url === s.chatWallpaperUrl)?.cacheDataUrl) || s.chatWallpaperUrl || ''} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">🖼️</span>
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold">Обои для чатов</div>
          <div className="text-white/70 text-sm">Выбрать изображение фона</div>
        </div>
        <span>›</span>
      </button>

      <div className="h-px bg-white/20 mx-1" />

      {/* Theme radio */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold mb-1">Тема</div>
        {[
          { k: 'light', label: 'Светлая' },
          { k: 'dark', label: 'Темная' },
          { k: 'auto', label: 'Авто' },
        ].map(opt => (
          <label key={opt.k} className="flex items-center gap-2">
            <input type="radio" name="themeMode" checked={appSettingsStore.state.theme === (opt.k as any)} onChange={() => appSettingsStore.setTheme(opt.k as any)} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Time format */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold mb-1">Формат времени</div>
        {[
          { k: '12h', label: '12-часовой формат' },
          { k: '24h', label: '24-часовой формат' },
        ].map(opt => (
          <label key={opt.k} className="flex items-center gap-2">
            <input type="radio" name="timeFormat" checked={appSettingsStore.state.timeFormat === (opt.k as any)} onChange={() => appSettingsStore.setTimeFormat(opt.k as any)} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Keyboard mode */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold mb-1">Клавиатура</div>
        <label className="flex items-start gap-2">
          <input type="radio" name="keyboardMode" checked={appSettingsStore.state.keyboardMode === 'enter'} onChange={() => appSettingsStore.setKeyboardMode('enter')} />
          <div>
            <div>Отправка по Enter</div>
            <div className="text-white/70 text-sm">Разрыв строки по сочетанию Shift + Enter</div>
          </div>
        </label>
        <label className="flex items-start gap-2">
          <input type="radio" name="keyboardMode" checked={appSettingsStore.state.keyboardMode === 'ctrlEnter'} onChange={() => appSettingsStore.setKeyboardMode('ctrlEnter')} />
          <div>
            <div>Отправка по Ctrl+Enter</div>
            <div className="text-white/70 text-sm">Разрыв строки по клавише Enter</div>
          </div>
        </label>
      </div>
      </div>
    </div>
  );
});

// WALLPAPERS SCREEN
const WallpapersScreen = observer(() => {
  const fileRef = useRef<HTMLInputElement>(null);
  const s = appSettingsStore.state;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      {/* Upload image */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const { uploadUrl, fileUrl, headers } = await presignForUpload({ filename: f.name, mime: f.type });
        await uploadToPresignedUrl(uploadUrl, f, headers);
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = (reader.result as string) || '';
          appSettingsStore.addWallpaperToGallery({ url: fileUrl, cacheDataUrl: dataUrl });
          appSettingsStore.setChatWallpaperUrl(fileUrl);
        };
        reader.readAsDataURL(f);
        e.currentTarget.value = '';
      }} />
      <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg" onClick={() => fileRef.current?.click()}>
        <span>📷</span>
        <span className="flex-1">Загрузить изображение</span>
      </button>

      {/* Set color */}
      <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg" onClick={() => settingsPanelStore.push('setColor')}>
        <span>🎨</span>
        <span className="flex-1">Задать цвет</span>
      </button>

      {/* Restore defaults */}
      <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg" onClick={() => {
        // restore defaults safely
        appSettingsStore.setChatWallpaperUrl(null);
        appSettingsStore.setChatWallpaperBlur(false);
      }}>
        <span>⭐</span>
        <span className="flex-1">Восстановить по умолчанию</span>
      </button>

      {/* Blur toggle */}
      <label className="flex items-center gap-2 px-3 py-3 bg-white/10 rounded-lg">
        <input type="checkbox" checked={s.chatWallpaperBlur} onChange={(e) => appSettingsStore.setChatWallpaperBlur(e.target.checked)} />
        <span>Размытие</span>
      </label>

      {/* Gallery grid 3 cols */}
      <div className="grid grid-cols-3 gap-2">
        {s.chatWallpaperGallery.map((g, idx) => (
          <button
            key={g.url + idx}
            className={`relative aspect-square rounded-md overflow-hidden border ${s.chatWallpaperUrl === g.url ? 'border-blue-400' : 'border-white/20'}`}
            onClick={async () => {
              // ensure cached
              if (!g.cacheDataUrl) {
                const url = await downloadFromUrl(g.url);
                appSettingsStore.addWallpaperToGallery({ url: g.url, cacheDataUrl: url });
              }
              appSettingsStore.setChatWallpaperUrl(g.url);
            }}
          >
            {g.cacheDataUrl ? (
              <img src={g.cacheDataUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">Нет превью</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});

// COLOR PICKER SCREEN
const SetColorScreen = observer(() => {
  const [hex, setHex] = useState(appSettingsStore.state.chatColor);
  const [rgb, setRgb] = useState(hexToRgbString(appSettingsStore.state.chatColor));
  const [temp, setTemp] = useState(0); // -100..100 warm/cool

  useEffect(() => {
    // sync from store if changed elsewhere
    const h = appSettingsStore.state.chatColor;
    setHex(h);
    setRgb(hexToRgbString(h));
  }, [appSettingsStore.state.chatColor]);

  const applyColor = (h: string) => {
    appSettingsStore.setChatColor(h);
  };

  const handleHexInput = (val: string) => {
    // keep leading '#', allow up to 7 chars #RRGGBB
    if (!val.startsWith('#')) val = '#' + val.replace(/^[#]*/, '');
    val = '#' + val.slice(1).replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setRgb(hexToRgbString(val));
      applyColor(val);
    }
  };

  const handleRgbInput = (val: string) => {
    // force commas and clamp 0..255
    const parts = val.split(',').map((p) => p.trim()).slice(0, 3);
    const nums = [0, 1, 2].map((i) => {
      const n = parseInt(parts[i] || '0', 10);
      return isNaN(n) ? 0 : Math.max(0, Math.min(255, n));
    });
    const text = nums.join(',');
    setRgb(text);
    const h = rgbToHex(nums[0], nums[1], nums[2]);
    setHex(h);
    applyColor(h);
  };

  const handleTemp = (t: number) => {
    setTemp(t);
    // shift hue lightly by temperature, keeping saturation/lightness similar
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    const h2 = (h + (t / 100) * 30 + 360) % 360; // shift up to 30deg
    const [r2, g2, b2] = hslToRgb(h2, s, l);
    const hNew = rgbToHex(r2, g2, b2);
    setHex(hNew);
    setRgb(`${r2},${g2},${b2}`);
    applyColor(hNew);
  };

  const palette = ['#2563eb','#1d4ed8','#f59e0b','#ef4444','#10b981','#22c55e','#d946ef','#ec4899','#a855f7','#06b6d4','#f97316','#84cc16'];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      {/* Visual picker */}
      <div className="bg-white/10 rounded-lg p-3 space-y-3">
        <input type="color" value={hex} onChange={(e) => { setHex(e.target.value); setRgb(hexToRgbString(e.target.value)); applyColor(e.target.value); }} className="w-full h-20 rounded-md p-0 border-0" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Теплые</span>
          <input type="range" min={-100} max={100} step={1} value={temp} onChange={(e) => handleTemp(parseInt(e.target.value, 10))} className="flex-1" />
          <span className="text-sm text-white/70">Холодные</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-white/70 mb-1">HEX</div>
            <input value={hex} onChange={(e) => handleHexInput(e.target.value)} className="w-full bg-white/5 rounded-md px-3 py-2" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-white/70 mb-1">RGB</div>
            <input value={rgb} onChange={(e) => handleRgbInput(e.target.value)} className="w-full bg-white/5 rounded-md px-3 py-2" />
          </div>
        </div>
      </div>

      {/* Palette grid 3x4 */}
      <div className="grid grid-cols-3 gap-2">
        {palette.map((c) => (
          <button key={c} className="aspect-square rounded-md" style={{ backgroundColor: c }} onClick={() => { setHex(c); setRgb(hexToRgbString(c)); applyColor(c); }} />
        ))}
      </div>
    </div>
  );
});

// helpers for color transformations
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [37,99,235];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function hexToRgbString(hex: string): string {
  const [r,g,b] = hexToRgb(hex);
  return `${r},${g},${b}`;
}
function componentToHex(c: number) {
  const v = Math.max(0, Math.min(255, Math.round(c)));
  const h = v.toString(16).padStart(2, '0');
  return h;
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [h, s, l];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
