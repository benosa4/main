import { observer } from 'mobx-react-lite';
import { settingsPanelStore } from '../../../features/settings-panel/model';
import { profileStore } from '../../../features/profile/model';
import { useEffect, useRef, useState } from 'react';
import { presignForUpload, uploadToPresignedUrl } from '../../../shared/media/api';
import appSettingsStore from '../../../shared/config/appSettings';
import { downloadFromUrl } from '../../../shared/media/api';
import ColorPicker from '../../../shared/ui/ColorPicker';

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
    current === 'privacy_blacklist' ? 'Конфиденциальность' :
    current === 'privacy_passcode' ? 'Код-пароль' :
    current === 'privacy_cloudpass' ? 'Облачный пароль' :
    current === 'privacy_sites' ? 'Подключенные сайты' :
    current === 'privacy_phone' ? 'Номер телефона' :
    current === 'privacy_lastSeen' ? 'Время захода' :
    current === 'privacy_photos' ? 'Фотографии профиля' :
    current === 'privacy_about' ? 'О себе' :
    current === 'privacy_birthday' ? 'Дата рождения' :
    current === 'privacy_gifts' ? 'Подарки' :
    current === 'privacy_forward' ? 'Пересылка сообщений' :
    current === 'privacy_calls' ? 'Звонки' :
    current === 'privacy_voice' ? 'Голосовые сообщения' :
    current === 'privacy_messages' ? 'Сообщения' :
    current === 'privacy_groups' ? 'Группы' :
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
        const inputEl = e.currentTarget as HTMLInputElement;
        const f = inputEl.files?.[0];
        if (!f) return;
        const { uploadUrl, fileUrl, headers } = await presignForUpload({ filename: f.name, mime: f.type });
        await uploadToPresignedUrl(uploadUrl, f, headers);
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = (reader.result as string) || '';
          profileStore.setAvatar({ remoteUrl: fileUrl, cacheDataUrl: dataUrl });
        };
        reader.readAsDataURL(f);
        if (fileRef.current) fileRef.current.value = '';
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
  const current = settingsPanelStore.stack[settingsPanelStore.stack.length - 1] || 'root';
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="h-full flex flex-col w-full">
        <NavBar />
        {current === 'root' && <RootScreen />}
        {current === 'general' && <GeneralScreen />}
        {current === 'wallpapers' && <WallpapersScreen />}
        {current === 'setColor' && <SetColorScreen />}
        {current === 'animation' && <AnimationScreen />}
        {current === 'notifications' && <NotificationsScreen />}
        {current === 'data' && <ScreenPlaceholder title="Экран: Данные и память" />}
        {current === 'data' && <DataMemoryScreen />}
        {current === 'privacy' && <PrivacyScreen />}
        {current === 'privacy_blacklist' && <BlacklistScreen />}
        {current === 'privacy_passcode' && <PasscodeScreen />}
        {current === 'privacy_cloudpass' && <CloudPasswordScreen />}
        {current === 'privacy_sites' && <ScreenPlaceholder title="Подключенные сайты" />}
        {(current === 'privacy_phone' || current === 'privacy_lastSeen' || current === 'privacy_photos' || current === 'privacy_about' || current === 'privacy_birthday' || current === 'privacy_gifts' || current === 'privacy_forward' || current === 'privacy_calls' || current === 'privacy_voice' || current === 'privacy_messages' || current === 'privacy_groups') && (
          <PrivacyVisibilityScreen />
        )}
        {current === 'folders' && <ScreenPlaceholder title="Экран: Папки с чатами" />}
        {current === 'sessions' && <ScreenPlaceholder title="Экран: Активные сеансы" />}
        {current === 'language' && <ScreenPlaceholder title="Экран: Язык" />}
        {current === 'stickers' && <ScreenPlaceholder title="Экран: Стикеры и эмодзи" />}
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
        className="absolute top-0 right-0 bottom-0 left-0 bg-black border-l border-white/20 will-change-transform flex flex-col overflow-hidden"
        style={{
          transform:
            appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.interface.rightMenu
              ? (slideIn ? 'translateX(0%)' : 'translateX(100%)')
              : 'translateX(0%)',
          transition:
            appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.interface.rightMenu
              ? 'transform 420ms ease'
              : 'none',
        }}
      >
        <Screens />
      </div>
    </div>
  );
});

export default SettingsPanel;

// ANIMATION SCREEN
const AnimationScreen = observer(() => {
  const s = appSettingsStore.state;
  const [openGroups, setOpenGroups] = useState<{[K in 'interface'|'stickers'|'autoplay']: boolean}>({ interface: true, stickers: false, autoplay: false });

  const sliderSet = (v: 'low'|'balanced'|'max') => {
    appSettingsStore.setAnimationProfile(v);
  };

  const groupChecked = (group: 'interface'|'stickers'|'autoplay') => Object.values((s.animationPrefs as any)[group]).every(Boolean);
  const groupIndeterminate = (group: 'interface'|'stickers'|'autoplay') => {
    const vals = Object.values((s.animationPrefs as any)[group]) as boolean[];
    return vals.some(Boolean) && !vals.every(Boolean);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      <div>
        <div className="font-semibold">Анимация</div>
        <div className="text-white/70 text-sm">Выберите параметры анимации.</div>
        {/* 3-position slider as segmented control */}
        <div className="mt-3 inline-flex rounded-lg bg-white/10 overflow-hidden">
          {[
            {k:'low', labelLeft:'Экономия ресурсов', label:'Экономия ресурсов'},
            {k:'balanced', labelLeft:'Баланс', label:'Баланс'},
            {k:'max', labelLeft:'Максимум анимации', label:'Максимум анимации'},
          ].map((opt, idx) => (
            <button
              key={opt.k}
              className={`px-3 py-2 text-sm ${s.animationProfile===opt.k?'bg-white/20':''} ${idx>0?'border-l border-white/10':''}`}
              onClick={() => sliderSet(opt.k as any)}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/20" />

      <div>
        <div className="font-semibold mb-2">Recourse-Intensive Processes</div>

        {/* Interface animations group */}
        <GroupRow
          title="Анимации интерфейса"
          checked={groupChecked('interface')}
          indeterminate={groupIndeterminate('interface')}
          open={openGroups.interface}
          onToggleOpen={() => setOpenGroups({...openGroups, interface: !openGroups.interface})}
          onToggleChecked={(val) => appSettingsStore.setAnimationGroupEnabled('interface', val)}
        />
        {openGroups.interface && (
          <div className="pl-6 space-y-2 mt-2">
            <SubCheck label="Переходы в меню и между чатами" value={s.animationPrefs.interface.menuTransitions} onChange={(v)=>appSettingsStore.setAnimationItem(['interface','menuTransitions'], v)} />
            <SubCheck label="Анимация отправки сообщени" value={s.animationPrefs.interface.sendMessage} onChange={(v)=>appSettingsStore.setAnimationItem(['interface','sendMessage'], v)} />
            <SubCheck label="Анимация при просмотре меди" value={s.animationPrefs.interface.mediaView} onChange={(v)=>appSettingsStore.setAnimationItem(['interface','mediaView'], v)} />
            <SubCheck label="Анимация при наборе сообщения," value={s.animationPrefs.interface.typing} onChange={(v)=>appSettingsStore.setAnimationItem(['interface','typing'], v)} />
            <SubCheck label="Анимация контекстных меню" value={s.animationPrefs.interface.contextMenus} onChange={(v)=>appSettingsStore.setAnimationItem(['interface','contextMenus'], v)} />
            <SubCheck label="Размытие в контекстных меню" value={s.animationPrefs.interface.contextBlur} onChange={(v)=>appSettingsStore.setAnimationItem(['interface','contextBlur'], v)} />
            <SubCheck label="Анимация в меню справа" value={s.animationPrefs.interface.rightMenu} onChange={(v)=>appSettingsStore.setAnimationItem(['interface','rightMenu'], v)} />
            <SubCheck label="Анимация удаления" value={s.animationPrefs.interface.deletion} onChange={(v)=>appSettingsStore.setAnimationItem(['interface','deletion'], v)} />
          </div>
        )}

        {/* Stickers and emoji */}
        <GroupRow
          title="Стикеры и эмодзи"
          checked={groupChecked('stickers')}
          indeterminate={groupIndeterminate('stickers')}
          open={openGroups.stickers}
          onToggleOpen={() => setOpenGroups({...openGroups, stickers: !openGroups.stickers})}
          onToggleChecked={(val) => appSettingsStore.setAnimationGroupEnabled('stickers', val)}
        />
        {openGroups.stickers && (
          <div className="pl-6 space-y-2 mt-2">
            <SubCheck label="Анимация эмодзи" value={s.animationPrefs.stickers.emojiAnimation} onChange={(v)=>appSettingsStore.setAnimationItem(['stickers','emojiAnimation'], v)} />
            <SubCheck label="Зациклить анимацию" value={s.animationPrefs.stickers.loopAnimation} onChange={(v)=>appSettingsStore.setAnimationItem(['stickers','loopAnimation'], v)} />
            <SubCheck label="Анимированные реакции" value={s.animationPrefs.stickers.animatedReactions} onChange={(v)=>appSettingsStore.setAnimationItem(['stickers','animatedReactions'], v)} />
            <SubCheck label="Эффекты стикеров" value={s.animationPrefs.stickers.stickerEffects} onChange={(v)=>appSettingsStore.setAnimationItem(['stickers','stickerEffects'], v)} />
          </div>
        )}

        {/* Autoplay */}
        <GroupRow
          title="Автовоспроизведение"
          checked={groupChecked('autoplay')}
          indeterminate={groupIndeterminate('autoplay')}
          open={openGroups.autoplay}
          onToggleOpen={() => setOpenGroups({...openGroups, autoplay: !openGroups.autoplay})}
          onToggleChecked={(val) => appSettingsStore.setAnimationGroupEnabled('autoplay', val)}
        />
        {openGroups.autoplay && (
          <div className="pl-6 space-y-2 mt-2">
            <SubCheck label="Автозапуск GIF" value={s.animationPrefs.autoplay.gif} onChange={(v)=>appSettingsStore.setAnimationItem(['autoplay','gif'], v)} />
            <SubCheck label="Автозапуск видео" value={s.animationPrefs.autoplay.video} onChange={(v)=>appSettingsStore.setAnimationItem(['autoplay','video'], v)} />
          </div>
        )}
      </div>
    </div>
  );
});

function GroupRow({ title, checked, indeterminate, open, onToggleOpen, onToggleChecked }: {
  title: string;
  checked: boolean;
  indeterminate?: boolean;
  open: boolean;
  onToggleOpen: () => void;
  onToggleChecked: (val: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <div className="flex items-center gap-2 py-2">
      <input ref={ref} type="checkbox" checked={checked} onChange={(e)=>onToggleChecked(e.target.checked)} />
      <button className="flex-1 text-left" onClick={onToggleOpen}>{title}</button>
      <button onClick={onToggleOpen} aria-label="toggle">
        <span className={`inline-block transition-transform ${open?'rotate-90':''}`}>›</span>
      </button>
    </div>
  );
}

function SubCheck({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={value} onChange={(e)=>onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

// NOTIFICATIONS SCREEN
const NotificationsScreen = observer(() => {
  const s = appSettingsStore.state.notifications;
  const onOff = (b: boolean) => (b ? 'Вкл' : 'Выкл');
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      {/* Web notifications */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold">Веб-уведомления</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.web} onChange={(e)=>appSettingsStore.setWebNotifications(e.target.checked)} />
          <div className="flex-1">
            <div>Веб-уведомления</div>
            <div className="text-white/70 text-sm">{onOff(s.web)}</div>
          </div>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.background} onChange={(e)=>appSettingsStore.setBackgroundNotifications(e.target.checked)} />
          <div className="flex-1">
            <div>Уведомления в фоне</div>
            <div className="text-white/70 text-sm">{onOff(s.background)}</div>
          </div>
        </label>
      </div>

      {/* Sound volume */}
      <div className="bg-white/10 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Громкость звука</div>
          <div className="text-white/70">{s.volume}</div>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={s.volume}
          onChange={(e)=>appSettingsStore.setNotificationsVolume(parseInt(e.target.value, 10))}
          className="w-full mt-2"
        />
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Direct chats */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold">Личные чаты</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.direct.enabled} onChange={(e)=>appSettingsStore.setDirectNotifications(e.target.checked)} />
          <div className="flex-1">
            <div>Уведомление из личных чатов</div>
            <div className="text-white/70 text-sm">{onOff(s.direct.enabled)}</div>
          </div>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.direct.preview} onChange={(e)=>appSettingsStore.setDirectPreview(e.target.checked)} />
          <div className="flex-1">
            <div>Предпросмотр сообщений</div>
            <div className="text-white/70 text-sm">{onOff(s.direct.preview)}</div>
          </div>
        </label>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Groups */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold">Группы</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.groups.enabled} onChange={(e)=>appSettingsStore.setGroupNotifications(e.target.checked)} />
          <div className="flex-1">
            <div>Уведомления из групп</div>
            <div className="text-white/70 text-sm">{onOff(s.groups.enabled)}</div>
          </div>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.groups.preview} onChange={(e)=>appSettingsStore.setGroupPreview(e.target.checked)} />
          <div className="flex-1">
            <div>Предпросмотр сообщений</div>
            <div className="text-white/70 text-sm">{onOff(s.groups.preview)}</div>
          </div>
        </label>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Channels */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold">Каналы</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.channels.enabled} onChange={(e)=>appSettingsStore.setChannelNotifications(e.target.checked)} />
          <div className="flex-1">
            <div>Уведомления из каналов</div>
            <div className="text-white/70 text-sm">{onOff(s.channels.enabled)}</div>
          </div>
        </label>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Other */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold">Другой</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.other.contactJoined} onChange={(e)=>appSettingsStore.setOtherContactJoined(e.target.checked)} />
          <div className="flex-1">
            <div>Контакт присоединился к Telegram</div>
          </div>
        </label>
      </div>
    </div>
  );
});

// DATA & MEMORY SCREEN
const DataMemoryScreen = observer(() => {
  const s = appSettingsStore.state.dataMemory;
  const Row = ({ label, group, onToggle }: { label: string; group: { contacts: boolean; direct: boolean; groups: boolean; channels: boolean }; onToggle: (k: 'contacts'|'direct'|'groups'|'channels', v: boolean)=>void }) => (
    <div className="space-y-2">
      <div className="font-semibold">{label}</div>
      {([
        {k: 'contacts', label: 'Контакты'},
        {k: 'direct', label: 'Другие личные чаты'},
        {k: 'groups', label: 'Группы'},
        {k: 'channels', label: 'Каналы'},
      ] as const).map(opt => (
        <label key={opt.k} className="flex items-center gap-2">
          <input type="checkbox" checked={group[opt.k]} onChange={(e)=>onToggle(opt.k, e.target.checked)} />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      <div className="bg-white/10 rounded-lg p-3">
        <Row label="Автозагрузка фото" group={s.autoPhoto} onToggle={(k,v)=>appSettingsStore.setAutoPhoto(k,v)} />
      </div>

      <div className="h-px bg-white/20 mx-1" />

      <div className="bg-white/10 rounded-lg p-3">
        <Row label="Автозагрузка видео и GIF" group={s.autoVideoGif} onToggle={(k,v)=>appSettingsStore.setAutoVideoGif(k,v)} />
      </div>

      <div className="h-px bg-white/20 mx-1" />

      <div className="bg-white/10 rounded-lg p-3">
        <Row label="Автозагрузка файлов" group={s.autoFiles} onToggle={(k,v)=>appSettingsStore.setAutoFiles(k,v)} />
      </div>

      <div className="h-px bg-white/20 mx-1" />

      <div className="bg-white/10 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Максимальный размер файла</div>
          <div className="text-white/70">до {s.maxFileSizeMb} МБ</div>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={s.maxFileSizeMb}
          onChange={(e)=>appSettingsStore.setMaxFileSizeMb(parseInt(e.target.value,10))}
          className="w-full mt-2"
        />
      </div>
    </div>
  );
});

// PRIVACY SCREEN
const PrivacyScreen = observer(() => {
  const p = appSettingsStore.state.privacy;
  const sub = (v: string) => v;
  const vis = p.visibilities;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      {/* Top items */}
      <div className="bg-white/10 rounded-lg">
        <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10" onClick={() => settingsPanelStore.push('privacy_blacklist')}>
          <span>🚫</span>
          <div className="flex-1 text-left">
            <div className="font-semibold">Чёрный список</div>
          </div>
          <span className="text-white/70">{(p.blacklist && p.blacklist.length) || p.blacklistCount || 0}</span>
        </button>
        <div className="h-px bg-white/20 mx-1" />
        <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10" onClick={() => settingsPanelStore.push('privacy_passcode')}>
          <span>🔑</span>
          <div className="flex-1 text-left">
            <div className="font-semibold">Код-пароль</div>
            <div className="text-white/70 text-sm">{p.passcodeEnabled ? 'Вкл' : 'Выкл'}</div>
          </div>
          <span>›</span>
        </button>
        <div className="h-px bg-white/20 mx-1" />
        <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10" onClick={() => settingsPanelStore.push('privacy_cloudpass')}>
          <span>🔒</span>
          <div className="flex-1 text-left">
            <div className="font-semibold">Облачный пароль</div>
            <div className="text-white/70 text-sm">{p.cloudPasswordEnabled ? 'Вкл' : 'Выкл'}</div>
          </div>
          <span>›</span>
        </button>
        <div className="h-px bg-white/20 mx-1" />
        <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10" onClick={() => settingsPanelStore.push('privacy_sites')}>
          <span>🌐</span>
          <div className="flex-1 text-left">
            <div className="font-semibold">Активные сайты</div>
          </div>
          <span className="text-white/70">{p.activeSitesCount}</span>
        </button>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Privacy block */}
      <div className="bg-white/10 rounded-lg">
        <ItemRow label="Кто видит мой номер телефона?" subtitle="Не использовать номер" onClick={() => settingsPanelStore.push('privacy_phone')} />
        <Divider />
        <ItemRow label="Кто видит время моего последнего захода?" subtitle={vis.lastSeen === 'everyone' ? 'Все' : vis.lastSeen === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_lastSeen')} />
        <Divider />
        <ItemRow label="Кто видит фото в моём профиле?" subtitle={vis.profilePhotos === 'everyone' ? 'Все' : vis.profilePhotos === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_photos')} />
        <Divider />
        <ItemRow label="О себе" subtitle={vis.about === 'everyone' ? 'Все' : vis.about === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_about')} />
        <Divider />
        <ItemRow label="Дата рождения" subtitle={vis.birthday === 'everyone' ? 'Все' : vis.birthday === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_birthday')} />
        <Divider />
        <ItemRow label="Подарки" subtitle={vis.gifts === 'miniapps' ? 'Мини-приложения' : vis.gifts === 'everyone' ? 'Все' : vis.gifts === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_gifts')} />
        <Divider />
        <ItemRow label="Кто может ссылаться на мой аккаунт при пересылке сообщений?" subtitle={vis.forwardLink === 'not_used' ? 'Не использовать' : vis.forwardLink === 'everyone' ? 'Все' : vis.forwardLink === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_forward')} />
        <Divider />
        <ItemRow label="Кто может мне звонить?" subtitle={vis.calls === 'everyone' ? 'Все' : vis.calls === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_calls')} />
        <Divider />
        <ItemRow label="Кто может отправлять мне голосовые и видеосообщения?" subtitle={vis.voiceMsgs === 'everyone' ? 'Все' : vis.voiceMsgs === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_voice')} />
        <Divider />
        <ItemRow label="Кто может отправлять мне сообщения?" subtitle={vis.messages === 'everyone' ? 'Все' : vis.messages === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_messages')} />
        <Divider />
        <ItemRow label="Кто может добавлять меня в группы?" subtitle={vis.groupAdd === 'everyone' ? 'Все' : vis.groupAdd === 'contacts' ? 'Контакты' : 'Никто'} onClick={() => settingsPanelStore.push('privacy_groups')} />
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Sensitive materials */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold">Материалы деликатного характера</div>
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={p.sensitive18plus} onChange={(e)=>appSettingsStore.setSensitive18(e.target.checked)} />
          <div>
            <div>Показывать материалы 18+</div>
            <div className="text-white/70 text-sm">Не скрывать медиафайлы, предназначенные только для взрослых</div>
          </div>
        </label>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Window title */}
      <div className="bg-white/10 rounded-lg p-3">
        <div className="font-semibold mb-2">Название окна</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={p.showChatWindowTitle} onChange={(e)=>appSettingsStore.setShowChatWindowTitle(e.target.checked)} />
          <span>Показывать название чата</span>
        </label>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Delete account */}
      <div className="bg-white/10 rounded-lg">
        <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10" onClick={()=>setShowDeleteModal(true)}>
          <div className="flex-1 text-left">
            <div className="font-semibold">Удалить мой аккаунт</div>
          </div>
          <span>Если я не захожу</span>
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={()=>setShowDeleteModal(false)}>
          <div className="bg-white text-black rounded-lg p-4 w-[min(420px,90vw)]" onClick={(e)=>e.stopPropagation()}>
            <div className="font-semibold mb-2">Удалить мой аккаунт</div>
            <div className="text-sm mb-4">Эмуляция: настройка периода не реализована в демо. Закройте окно.</div>
            <div className="flex justify-end">
              <button className="px-3 py-1 rounded bg-gray-200" onClick={()=>setShowDeleteModal(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const Divider = () => <div className="h-px bg-white/20 mx-1" />;
const ItemRow = ({ label, subtitle, onClick }: { label: string; subtitle?: string; onClick?: ()=>void }) => (
  <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10" onClick={onClick}>
    <div className="flex-1 text-left">
      <div className="font-semibold">{label}</div>
      {subtitle && <div className="text-white/70 text-sm">{subtitle}</div>}
    </div>
    <span>›</span>
  </button>
);

// Detail: Blacklist list
const BlacklistScreen = observer(() => {
  const list = appSettingsStore.state.privacy.blacklist || [];
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      <div className="bg-white/10 rounded-lg p-3 text-sm text-white/80">
        Заблокированные пользователи не могут писать Вам и приглашать Вас в группы. Они также не видят Вашу фотографию, истории и время последнего захода.Э
      </div>
      <div className="bg-white/10 rounded-lg">
        {list.length === 0 ? (
          <div className="px-3 py-3 text-white/70">Список пуст</div>
        ) : (
          list.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-3 py-2 border-b border-white/10 last:border-b-0">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">{(u.displayName||'U').slice(0,1)}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{u.displayName}</div>
                <div className="text-white/70 text-sm truncate">гыуктфьу {u.username}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

// Detail: Passcode
const PasscodeScreen = observer(() => {
  const on = appSettingsStore.state.privacy.passcodeEnabled;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3">
      <label className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
        <input type="checkbox" checked={on} onChange={(e)=>appSettingsStore.setPasscodeEnabled(e.target.checked)} />
        <div className="flex-1">
          <div className="font-semibold">Код-пароль</div>
          <div className="text-white/70 text-sm">{on ? 'Вкл' : 'Выкл'}</div>
        </div>
      </label>
    </div>
  );
});

// Detail: Cloud password
const CloudPasswordScreen = observer(() => {
  const on = appSettingsStore.state.privacy.cloudPasswordEnabled;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3">
      <label className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
        <input type="checkbox" checked={on} onChange={(e)=>appSettingsStore.setCloudPasswordEnabled(e.target.checked)} />
        <div className="flex-1">
          <div className="font-semibold">Облачный пароль</div>
          <div className="text-white/70 text-sm">{on ? 'Вкл' : 'Выкл'}</div>
        </div>
      </label>
    </div>
  );
});

// Detail: Visibility generic screen
const PrivacyVisibilityScreen = observer(() => {
  const current = settingsPanelStore.stack[settingsPanelStore.stack.length - 1] as string;
  const map: Record<string, { key: keyof typeof appSettingsStore.state.privacy.visibilities; label: string; options: {k:any; label:string}[] }> = {
    privacy_phone: { key: 'phoneNumber', label: 'Номер телефона', options: [
      { k: 'not_used', label: 'Не использовать' },
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_lastSeen: { key: 'lastSeen', label: 'Время захода', options: [
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_photos: { key: 'profilePhotos', label: 'Фотографии профиля', options: [
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_about: { key: 'about', label: 'О себе', options: [
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_birthday: { key: 'birthday', label: 'Дата рождения', options: [
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_gifts: { key: 'gifts', label: 'Подарки', options: [
      { k: 'miniapps', label: 'Мини-приложения' },
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_forward: { key: 'forwardLink', label: 'Пересылка сообщений', options: [
      { k: 'not_used', label: 'Не использовать' },
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_calls: { key: 'calls', label: 'Звонки', options: [
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_voice: { key: 'voiceMsgs', label: 'Голосовые сообщения', options: [
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_messages: { key: 'messages', label: 'Сообщения', options: [
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
    privacy_groups: { key: 'groupAdd', label: 'Группы', options: [
      { k: 'everyone', label: 'Все' },
      { k: 'contacts', label: 'Контакты' },
      { k: 'nobody', label: 'Никто' },
    ] },
  };
  const conf = map[current];
  const value = appSettingsStore.state.privacy.visibilities[conf.key] as any;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3">
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold mb-1">{conf.label}</div>
        {conf.options.map(opt => (
          <label key={opt.k} className="flex items-center gap-2">
            <input type="radio" name={`vis_${conf.key}`} checked={value === opt.k} onChange={()=>appSettingsStore.setPrivacyVisibility(conf.key as any, opt.k as any)} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
});

// GENERAL SCREEN IMPLEMENTATION
const GeneralScreen = observer(() => {
  const s = appSettingsStore.state;

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-custom">
      <div className="space-y-3 pr-5 pl-[5px] box-border max-w-full">
        {/* Text Size */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Настройки текста</div>
            <div className="text-white/70">{s.textSize}px</div>
          </div>
          <input
            type="range"
            min={12}
            max={24}
            step={1}
            value={s.textSize}
            onChange={(e) => appSettingsStore.setTextSize(parseInt(e.target.value, 10))}
            className="w-full mt-2"
          />
        </div>

      {/* Wallpapers & color */}
      <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg" onClick={() => settingsPanelStore.push('wallpapers')}>
        <div className="w-36 h-24 rounded-md overflow-hidden bg-white/10 flex items-center justify-center">
          {s.chatWallpaperUrl ? (
            <img src={(s.chatWallpaperGallery.find(g => g.url === s.chatWallpaperUrl)?.cacheDataUrl) || s.chatWallpaperUrl || ''} className="w-full h-full object-cover" />
          ) : (
            <img src={'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTIwJyBoZWlnaHQ9JzcwJyB2aWV3Qm94PScwIDAgMTIwIDcwJyBmaWxsPSdub25lJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZycgeDE9JzAnIHkxPScwJyB4Mj0nMTAwJScgeTI9JzEwMCUnPjxzdG9wIG9mZnNldD0nMCUnIHN0b3AtY29sb3I9JyM0MDQwNjAnLz48c3RvcCBvZmZzZXQ9JzEwMCUnIHN0b3AtY29sb3I9JyM3MDc4OTAnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nMTIwJyBoZWlnaHQ9JzcwJyByeD0nMTInIGZpbGw9InVybCgjZykiLz48cGF0aCBkPSdNNDQgNDZsMTItMTQgMTYgMjAgOCAxMEg0NCcgZmlsbD0nI2ZmZicgZmlsbC1vcGFjaXR5PScwLjknLz48Y2lyY2xlIGN4PSc1NCcgY3k9JzMyJyByPSc4JyBzdHJva2U9JyNmZmYnIHN0cm9rZS1vcGFjaXR5PScwLjknIGZpbGw9J25vbmUnLz48L3N2Zz4='} className="w-full h-full object-cover" />
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
        const inputEl = e.currentTarget as HTMLInputElement;
        const f = inputEl.files?.[0];
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
        if (fileRef.current) fileRef.current.value = '';
      }} />
      <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg" onClick={() => fileRef.current?.click()}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7h3l2-2h6l2 2h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" stroke="white" strokeOpacity="0.9"/>
          <circle cx="12" cy="13" r="3.5" stroke="white" strokeOpacity="0.9"/>
        </svg>
        <span className="flex-1 text-left">Загрузить изображение</span>
      </button>

      {/* Set color */}
      <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg" onClick={() => settingsPanelStore.push('setColor')}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3a9 9 0 100 18 2 2 0 002-2 2 2 0 012-2h1a2 2 0 000-4h-1a2 2 0 01-2-2 2 2 0 00-2-2" stroke="white" strokeOpacity="0.9"/>
        </svg>
        <span className="flex-1 text-left">Задать цвет</span>
      </button>

      {/* Restore defaults */}
      <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg" onClick={() => {
        // restore defaults safely
        appSettingsStore.setChatWallpaperUrl(null);
        appSettingsStore.setChatWallpaperBlur(false);
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l2.8 5.67 6.26.91-4.53 4.41 1.07 6.23L12 16.9l-5.6 2.95 1.07-6.23L2.94 8.58l6.26-.91L12 2z" stroke="white" strokeOpacity="0.9" fill="none"/>
        </svg>
        <span className="flex-1 text-left">Восстановить по умолчанию</span>
      </button>

      {/* Blur toggle */}
      <label className="flex items-center gap-2 px-3 py-3 bg-white/10 rounded-lg">
        <input type="checkbox" checked={s.chatWallpaperBlur} onChange={(e) => appSettingsStore.setChatWallpaperBlur(e.target.checked)} />
        <span>Размытие</span>
      </label>

      {/* Gallery grid larger thumbs */}
      <div className="grid grid-cols-2 gap-3">
        {s.chatWallpaperGallery.map((g, idx) => (
          <button
            key={g.url + idx}
            className={`relative aspect-[4/3] rounded-md overflow-hidden border ${s.chatWallpaperUrl === g.url ? 'border-blue-400' : 'border-white/20'}`}
            onClick={async () => {
              // ensure cached
              if (!g.cacheDataUrl) {
                const data = await downloadFromUrl(g.url);
                appSettingsStore.addWallpaperToGallery({ url: g.url, cacheDataUrl: data });
              }
              appSettingsStore.setChatWallpaperUrl(g.url);
            }}
          >
            {g.cacheDataUrl ? (
              <img src={g.cacheDataUrl} className="w-full h-full object-cover" />
            ) : (
              <img src={'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTIwJyBoZWlnaHQ9JzcwJyB2aWV3Qm94PScwIDAgMTIwIDcwJyBmaWxsPSdub25lJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZycgeDE9JzAnIHkxPScwJyB4Mj0nMTAwJScgeTI9JzEwMCUnPjxzdG9wIG9mZnNldD0nMCUnIHN0b3AtY29sb3I9JyM0MDQwNjAnLz48c3RvcCBvZmZzZXQ9JzEwMCUnIHN0b3AtY29sb3I9JyM3MDc4OTAnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nMTIwJyBoZWlnaHQ9JzcwJyByeD0nMTInIGZpbGw9InVybCgjZykiLz48cGF0aCBkPSdNNDQgNDZsMTItMTQgMTYgMjAgOCAxMEg0NCcgZmlsbD0nI2ZmZicgZmlsbC1vcGFjaXR5PScwLjknLz48Y2lyY2xlIGN4PSc1NCcgY3k9JzMyJyByPSc4JyBzdHJva2U9JyNmZmYnIHN0cm9rZS1vcGFjaXR5PScwLjknIGZpbGw9J25vbmUnLz48L3N2Zz4='} className="w-full h-full object-cover opacity-80" />
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
    // remove wallpaper when choosing a color theme
    appSettingsStore.setChatWallpaperUrl(null);
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
        <div className="flex items-center justify-between">
          <div className="font-semibold">Палитра</div>
          {'EyeDropper' in window ? (
            <button
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
              onClick={async () => {
                try {
                  // @ts-ignore experimental API
                  const ed = new (window as any).EyeDropper();
                  const res = await ed.open();
                  if (res?.sRGBHex) {
                    setHex(res.sRGBHex);
                    setRgb(hexToRgbString(res.sRGBHex));
                    applyColor(res.sRGBHex);
                  }
                } catch {}
              }}
            >
              Пипетка
            </button>
          ) : null}
        </div>
        <ColorPicker
          hex={hex}
          onChange={(h) => { setHex(h); setRgb(hexToRgbString(h)); applyColor(h); }}
        />
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
