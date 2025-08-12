import { observer } from 'mobx-react-lite';
import { settingsPanelStore } from '../../../features/settings-panel/model';
import { profileStore } from '../../../features/profile/model';
import { useEffect, useRef, useState } from 'react';
import { presignForUpload, uploadToPresignedUrl } from '../../../shared/media/api';

const NavBar = observer(() => {
  const current = settingsPanelStore.stack[settingsPanelStore.stack.length - 1] || 'root';
  const title = current === 'root' ? 'Настройки' :
    current === 'general' ? 'Общие настройки' :
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
            {s === 'general' && <ScreenPlaceholder title="Экран: Общие настройки" />}
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
