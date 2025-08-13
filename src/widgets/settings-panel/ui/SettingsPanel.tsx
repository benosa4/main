import { observer } from 'mobx-react-lite';
import { settingsPanelStore } from '../../../features/settings-panel/model';
import { profileStore } from '../../../features/profile/model';
import { useEffect, useRef, useState } from 'react';
import { presignForUpload, uploadToPresignedUrl } from '../../../shared/media/api';
import appSettingsStore from '../../../shared/config/appSettings';
import { downloadFromUrl } from '../../../shared/media/api';
import ColorPicker from '../../../shared/ui/ColorPicker';
import { chatTabsStore } from '../../../features/chat-tabs/model';
import { chatStore } from '../../../features/chats/model';
import { loadSessionsFromDB, loadSessionsFromRemote, saveSessionsToDB, saveSessionsToRemote, type SessionDTO } from '../../../shared/db';
import { emojiToSvgUrl, emojiToPngUrl } from '../../../shared/emoji/twemojify';

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
    current === 'stickers' ? 'Стикеры и эмодзи' :
    current === 'stickers_emoji' ? 'Эмодзи' :
    current === 'stickers_quick' ? 'Эмодзи' : 'Настройки';
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
        <PremiumEntry />
        <StarsEntry />
        <TonEntry />
        <GiftEntry />
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

import React from 'react';
import { TonIcon } from '../../../features/wallets';

const MenuItem = ({ icon, label, right, onClick, highlight }: { icon: string | React.ReactNode; label: string; right?: string; onClick?: () => void; highlight?: boolean }) => {
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'string') {
      if (icon === 'TON') return <TonIcon size={22} />;
      // Render emoji as image to avoid missing glyph squares
      try {
        const src = emojiToSvgUrl(icon);
        const fallback = emojiToPngUrl(icon as string);
        return (
          <img
            src={src}
            alt=""
            className="w-8 h-8"
            onError={(ev)=>{ (ev.currentTarget as HTMLImageElement).src = fallback; }}
          />
        );
      } catch {
        return <span>{icon}</span>;
      }
    }
    return null;
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-white/10 ${highlight ? 'text-purple-300' : ''}`}>
      <span className="w-10 h-10 flex items-center justify-center">{renderIcon()}</span>
      <span className="flex-1">{label}</span>
      {right ? <span className="text-white/70">{right}</span> : null}
    </button>
  );
};

import StarsModal from '../../../features/stars/ui/StarsModal';
import PremiumModal from '../../../features/premium/ui/PremiumModal';
import { TonModal } from '../../../features/wallets';
import { GiftContactsDialog, Contact as GiftContact, Page as GiftPage } from '../../../features/gifting';

const PremiumEntry = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MenuItem icon="⭐" label="Telegram Premium" onClick={() => setOpen(true)} highlight />
      <PremiumModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async () => { await new Promise(r=>setTimeout(r,600)); setOpen(false); }}
        defaultPlan="annual"
        prices={{ annual: { total: 1990, monthly: 165.83, discountLabel: '-45%' }, monthly: { total: 299, monthly: 299 } }}
      />
    </>
  );
};

const StarsEntry = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MenuItem icon="🌟" label="Мои звезды" right="0" onClick={() => setOpen(true)} />
      <StarsModal
        open={open}
        onClose={() => setOpen(false)}
        balance={{ amount: 849 }}
        historyApi={{ fetch: async (filter, page) => {
          const base = Array.from({ length: 20 }, (_, i) => ({ id: `op-${page}-${i}`, title: i%3===0?'Покупка в Mini App':'Зачисление бонусов', subtitle: i%3===0?'Оплата контента':'Подарок от друга', date: 'сегодня', sign: i%3===0?'-':'+', amount: (i%3===0?75:100)+i, avatarUrl: 'https://placehold.co/36x36' }));
          const items = filter==='income'? base.filter(b=>b.sign==='+') : filter==='outcome'? base.filter(b=>b.sign==='-') : base;
          return { items, nextPage: page+1 };
        }}}
        purchaseApi={{ list: async () => [
          { id: 'p100', qty: 100, price: 99 },
          { id: 'p250', qty: 250, price: 249 },
          { id: 'p500', qty: 500, price: 499 },
          { id: 'p1000', qty: 1000, price: 999 },
          { id: 'p2500', qty: 2500, price: 2390 },
          { id: 'p10000', qty: 10000, price: 9290 },
          { id: 'p50000', qty: 50000, price: 43900 },
          { id: 'p150000', qty: 150000, price: 129900 },
          { id: 'p2500b', qty: 2500, price: 2490 },
          { id: 'p5000b', qty: 5000, price: 4790 },
          { id: 'p10000b', qty: 10000, price: 9490 },
          { id: 'p25000b', qty: 25000, price: 23490 },
          { id: 'p50000b', qty: 50000, price: 45990 },
          { id: 'p100000b', qty: 100000, price: 89990 },
          { id: 'p150000b', qty: 150000, price: 134990 },
        ], buy: async () => {} }}
        giftApi={{ searchContacts: async (q, page) => ({ items: Array.from({ length: 20 }, (_, i)=>({ id: `${page}-${i}`, name: `Контакт ${i+1}`, subtitle: 'был(а) недавно', avatarUrl: 'https://placehold.co/36x36' })) }), startGift: async () => {} }}
      />
    </>
  );
};

const TonEntry = () => {
  const [open, setOpen] = useState(false);
  // TODO: hook real balance; using mock now
  const balanceTon = 0;
  const usdRate: number | undefined = 5.1;
  return (
    <>
      <MenuItem icon="TON" label="My TON" right={String(balanceTon)} onClick={() => setOpen(true)} />
      <TonModal
        open={open}
        onClose={() => { setOpen(false) }}
        onTopUp={() => { /* open Fragment or callback */ }}
        balanceTon={balanceTon}
        usdRate={usdRate}
      />
    </>
  );
}

const GiftEntry = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <MenuItem icon="🎁" label="Отправить подарок" onClick={() => setOpen(true)} />
      <GiftContactsDialog
        open={open}
        onClose={() => setOpen(false)}
        onContinue={() => setOpen(false)}
        pageSize={30}
        fetchContacts={async ({ query, cursor, limit }) => {
          const pageNum = cursor ? parseInt(cursor, 10) : 1;
          const all = Array.from({ length: 500 }, (_, i) => ({
            id: `c${i+1}`,
            name: `Контакт ${i+1}`,
            lastSeenText: 'был(а) недавно',
            avatarUrl: undefined,
          })).filter(c => c.name.toLowerCase().includes((query||'').toLowerCase()));
          const start = (pageNum - 1) * limit;
          const items = all.slice(start, start + limit);
          const nextCursor = start + limit < all.length ? String(pageNum + 1) : null;
          return { items, nextCursor } as GiftPage<GiftContact>;
        }}
      />
    </>
  );
}

const ScreenPlaceholder = ({ title }: { title: string }) => (
  <div className="flex-1 overflow-y-auto scrollbar-custom p-3">{title}</div>
);

// STICKERS & EMOJI SCREEN
const StickersEmojiScreen = observer(() => {
  const s = appSettingsStore.state.stickersEmoji;
  const setsCount = s.emojiSets.sets.length;
  const quick = s.quickReaction.selected;
  const quickSrc = emojiToSvgUrl(quick);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      {/* Emoji hint */}
      <div className="bg-white/10 rounded-lg p-3">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={s.emojiHints} onChange={(e)=>appSettingsStore.setEmojiHints(e.target.checked)} />
          <div className="flex-1">
            <div className="font-semibold">Подсказка по эмодзи</div>
          </div>
        </label>
      </div>

      {/* Emoji sets link */}
      <button className="w-full flex items-center gap-3 px-3 py-3 bg-white/10 rounded-lg hover:bg-white/15" onClick={() => settingsPanelStore.push('stickers_emoji')}>
        <img src={emojiToSvgUrl('😊')} alt="emoji" className="w-8 h-8" onError={(ev)=>{(ev.currentTarget as HTMLImageElement).src = emojiToPngUrl('😊')}} />
        <div className="flex-1 text-left">
          <div className="font-semibold">Наборы эмодзи</div>
        </div>
        <div className="text-white/70">{setsCount}</div>
      </button>

      {/* Quick reaction link */}
      <button className="w-full flex items-center gap-3 px-3 py-3 bg-white/10 rounded-lg hover:bg-white/15" onClick={() => settingsPanelStore.push('stickers_quick')}>
        <img src={quickSrc} alt={quick} className="w-8 h-8" onError={(ev)=>{(ev.currentTarget as HTMLImageElement).src = emojiToPngUrl(quick)}} />
        <div className="flex-1 text-left">
          <div className="font-semibold">Быстрая реакция</div>
        </div>
      </button>

      <div className="h-px bg-white/20 mx-1" />

      {/* Recent first group */}
      <div className="bg-white/10 rounded-lg p-3 space-y-1">
        <div className="font-semibold">Сначала недавние</div>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={s.recentFirst} onChange={(e)=>appSettingsStore.setRecentFirst(e.target.checked)} />
          <div className="flex-1">
            <div>Сначала недавние</div>
          </div>
        </label>
        <div className="text-sm text-white/70">В начале списка будут отображаться недавно использованные наборы.</div>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* My sticker sets info */}
      <div className="bg-white/10 rounded-lg p-3">
        <div className="font-semibold mb-1">Мои наборы стикеров</div>
        <div className="text-sm text-white/80">Художники могут создавать собственные наборы с помощью бота @stickers</div>
      </div>
    </div>
  );
});

const EmojiSetsScreen = observer(() => {
  const s = appSettingsStore.state.stickersEmoji;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={s.emojiSets.showInsteadOfStickers} onChange={(e)=>appSettingsStore.setEmojiSetsShowInsteadOfStickers(e.target.checked)} />
          <div className="flex-1">
            <div className="font-semibold">Показывать вместо стикеров</div>
          </div>
        </label>
        <div className="text-sm text-white/70">Художники могут создавать собственные наборы с помощью бота @stickers</div>
      </div>
    </div>
  );
});

const QuickReactionScreen = observer(() => {
  const s = appSettingsStore.state.stickersEmoji;
  const selected = s.quickReaction.selected;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-2">
      {s.quickReaction.options.map((opt) => (
        <label key={opt.id} className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/15">
          <img
            src={emojiToSvgUrl(opt.native)}
            alt={opt.name}
            className="w-7 h-7"
            onError={(ev)=>{(ev.currentTarget as HTMLImageElement).src = emojiToPngUrl(opt.native)}}
          />
          <div className="flex-1">{opt.name}</div>
          <input
            type="radio"
            name="quick-reaction"
            checked={selected === opt.native}
            onChange={() => appSettingsStore.setQuickReaction(opt.native)}
          />
        </label>
      ))}
    </div>
  );
});

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
        {current === 'data' && <DataMemoryScreen />}
        {current === 'privacy' && <PrivacyScreen />}
        {current === 'privacy_blacklist' && <BlacklistScreen />}
        {current === 'privacy_passcode' && <PasscodeScreen />}
        {current === 'privacy_cloudpass' && <CloudPasswordScreen />}
        {current === 'privacy_sites' && <ScreenPlaceholder title="Подключенные сайты" />}
        {(current === 'privacy_phone' || current === 'privacy_lastSeen' || current === 'privacy_photos' || current === 'privacy_about' || current === 'privacy_birthday' || current === 'privacy_gifts' || current === 'privacy_forward' || current === 'privacy_calls' || current === 'privacy_voice' || current === 'privacy_messages' || current === 'privacy_groups') && (
          <PrivacyVisibilityScreen />
        )}
        {current === 'folders' && <FoldersScreen />}
        {current === 'sessions' && <SessionsScreen />}
        {current === 'language' && <LanguageScreen />}
        {current === 'stickers' && <StickersEmojiScreen />}
        {current === 'stickers_emoji' && <EmojiSetsScreen />}
        {current === 'stickers_quick' && <QuickReactionScreen />}
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

// FOLDERS (CHAT TABS) SCREEN
const FoldersScreen = observer(() => {
  // ensure tabs and chats are loaded (SettingsPanel exists over Chat page, but we guard basic init)
  useEffect(() => {
    if (!chatTabsStore.tabs.length) chatTabsStore.load().catch(()=>{});
    if (!chatStore.chats.length) chatStore.load().catch(()=>{});
  }, []);

  const tabs = chatTabsStore.tabs;
  const userTabs = tabs.filter((t) => t.id !== 1);
  const allCount = chatStore.chats.length; // no archived notion in demo

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [menuFor, setMenuFor] = useState<number | null>(null);

  const onDrop = () => {
    if (dragIndex == null || overIndex == null) {
      setDragIndex(null); setOverIndex(null);
      return;
    }
    // account for the All tab at top (non-draggable), we reorder within userTabs then map back
    const from = dragIndex + 1;
    const to = overIndex + 1;
    chatTabsStore.reorderTabs(from, to);
    setDragIndex(null); setOverIndex(null);
  };

  const countFor = (tabId: number) => tabs.find((t) => t.id === tabId)?.chatIds.length || 0;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-4">
      <div className="flex flex-col items-center text-center bg-white/10 rounded-lg p-6">
        <div className="w-20 h-16 mb-2 flex items-center justify-center">
          <span style={{fontSize: 48}}>📁</span>
        </div>
        <div className="text-white/80 max-w-md">Вы можете создать папки с нужными чатами и переключаться между ними.</div>
        <button
          className="mt-4 px-6 py-2 rounded-full bg-white/80 text-black hover:bg-white"
          onClick={() => {
            const name = prompt('Название папки');
            if (!name) return;
            chatTabsStore.addTab(name, []);
          }}
        >
          Создать новую папку
        </button>
      </div>

      <div className="space-y-2">
        <div className="font-semibold">Папки с чатами</div>
        {/* All chats */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg">
          <span>📂</span>
          <div className="flex-1">
            <div className="font-semibold">Все чаты</div>
            <div className="text-white/70 text-sm">All unarchived chats</div>
          </div>
          <div className="text-white/70">{allCount}</div>
        </div>

        {/* User tabs list */}
        <div className="space-y-2">
          {userTabs.map((t, i) => (
            <div
              key={t.id}
              className={`relative flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg group ${overIndex===i?'outline outline-1 outline-blue-400':''}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
              onDragEnd={() => onDrop()}
              onDrop={(e)=>{ e.preventDefault(); onDrop(); }}
            >
              <span className="opacity-0 group-hover:opacity-100 cursor-grab select-none">≡</span>
              <div className="flex-1">
                <div className="font-semibold">{t.label}</div>
                <div className="text-white/70 text-sm">{countFor(t.id)} чатов</div>
              </div>
              <button className="opacity-100 ml-auto px-2 py-1" onClick={() => setMenuFor(menuFor===t.id?null:t.id)} aria-label="more">⋮</button>
              {menuFor === t.id && (
                <div className="absolute top-full right-2 mt-1 bg-white text-black rounded shadow-lg text-sm z-10">
                  <button className="px-3 py-2 hover:bg-gray-100 w-full text-left" onClick={() => { chatTabsStore.removeTab(t.id); setMenuFor(null); }}>Удалить</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/20" />

      {/* Recommended */}
      <div className="space-y-2">
        <div className="font-semibold">Рекомендованные папки</div>
        <div className="bg-white/10 rounded-lg">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1">
              <div className="font-semibold">Новые</div>
              <div className="text-white/70 text-sm">Чаты с новыми сообщениями</div>
            </div>
            <button
              className="px-4 py-1 rounded-full bg-white/80 text-black hover:bg-white"
              onClick={() => {
                const ids = chatStore.chats.filter(c => (c.unread||0) > 0).map(c => c.id);
                const exists = chatTabsStore.tabs.find(t => t.label === 'Новые');
                if (exists) {
                  exists.chatIds = ids; void chatTabsStore.persist();
                } else {
                  chatTabsStore.addTab('Новые', ids);
                }
              }}
            >Добавить</button>
          </div>
          <div className="h-px bg-white/20 mx-1" />
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1">
              <div className="font-semibold">Личные</div>
              <div className="text-white/70 text-sm">Сообщения из личных чатов</div>
            </div>
            <button
              className="px-4 py-1 rounded-full bg-white/80 text-black hover:bg-white"
              onClick={() => {
                const ids = chatStore.chats.filter(c => c.type === 'private').map(c => c.id);
                const exists = chatTabsStore.tabs.find(t => t.label === 'Личные');
                if (exists) {
                  exists.chatIds = ids; void chatTabsStore.persist();
                } else {
                  chatTabsStore.addTab('Личные', ids);
                }
              }}
            >Добавить</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// SESSIONS SCREEN
const SessionsScreen = observer(() => {
  const [sessions, setSessions] = useState<SessionDTO[]>([]);

  // Load sessions from DB, fallback to mock, then persist
  useEffect(() => {
    (async () => {
      const local = await loadSessionsFromDB();
      if (local && local.length) {
        setSessions(local);
        return;
      }
      let remote = await loadSessionsFromRemote();
      if (!remote || !remote.length) {
        // seed mock remote
        const now = Date.now();
        remote = [
          { id: 's1', browser: 'Chrome', clientVersion: 'Web 1.0.0', location: 'Moscow, RU', lastActiveAt: new Date(now - 3600_000).toISOString() },
          { id: 's2', browser: 'Firefox', clientVersion: 'Web 1.0.0', location: 'Berlin, DE', lastActiveAt: new Date(now - 86400_000).toISOString() },
        ];
        await saveSessionsToRemote(remote);
      }
      await saveSessionsToDB(remote);
      setSessions(remote);
    })().catch(() => {});
  }, []);

  // Current device info
  const ua = navigator.userAgent;
  const browser = /Chrome/i.test(ua) && !/Edge|OPR/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) && !/Chrome/i.test(ua) ? 'Safari' : /Edg/i.test(ua) ? 'Edge' : 'Web';
  const icon = browser === 'Chrome' ? '🔵' : browser === 'Firefox' ? '🦊' : browser === 'Safari' ? '🧭' : browser === 'Edge' ? '🟢' : '🌐';
  const clientVersion = 'Web ' + (import.meta?.env?.VITE_APP_VERSION || '1.0.0');
  const location = 'Your location';

  const opts: { key: any; label: string }[] = [
    { key: '1w', label: '1 нед.' },
    { key: '1m', label: '1 месяц' },
    { key: '3m', label: '3 месяца' },
    { key: '6m', label: '6 месяцев' },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      {/* This device */}
      <div className="bg-white/10 rounded-lg">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center text-xl">{icon}</div>
          <div className="flex-1">
            <div className="font-semibold">{browser}</div>
            <div className="text-white/70 text-sm">{clientVersion}</div>
            <div className="text-white/70 text-sm">вход с: {location}</div>
          </div>
        </div>
        <div className="h-px bg-white/20 mx-1" />
        <button className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10" onClick={() => {
          // mock: "завершить все другие сеансы" — очистим локальные кроме текущего (не храним id текущего — no-op)
          setSessions([]);
          saveSessionsToDB([]).catch(()=>{});
          saveSessionsToRemote([]).catch(()=>{});
        }}>
          <span>🗑️</span>
          <div className="flex-1 text-left">
            <div className="font-semibold">Завершить все другие сеансы</div>
          </div>
        </button>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Active sessions list */}
      <div className="bg-white/10 rounded-lg">
        <div className="px-3 py-2 font-semibold">Активные сеансы</div>
        {sessions.length === 0 ? (
          <div className="px-3 py-3 text-white/70">Сеансов нет</div>
        ) : sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-3 py-3 border-t border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center text-xl">{icon}</div>
            <div className="flex-1">
              <div className="font-semibold">{s.browser}</div>
              <div className="text-white/70 text-sm">{s.clientVersion}</div>
              <div className="text-white/70 text-sm">вход с: {s.location}</div>
            </div>
            <div className="text-white/70 text-sm whitespace-nowrap">{new Date(s.lastActiveAt).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Auto end */}
      <div className="bg-white/10 rounded-lg p-3">
        <div className="font-semibold mb-2">Автоматически завершать сеансы</div>
        <div className="mb-1">Если сеанс не активен:</div>
        {opts.map((o) => (
          <label key={o.key} className="flex items-center gap-2">
            <input type="radio" name="autoEndSessions" checked={appSettingsStore.state.sessionsConfig.autoEndAfter === o.key} onChange={()=>appSettingsStore.setSessionsAutoEnd(o.key)} />
            <span>{o.label}</span>
          </label>
        ))}
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

// LANGUAGE SCREEN
const LanguageScreen = observer(() => {
  const s = appSettingsStore.state.language;
  const isPremium = appSettingsStore.state.premium;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-3">
      {/* Translate options */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.showTranslateButton} onChange={(e)=>appSettingsStore.setShowTranslateButton(e.target.checked)} />
          <span>Показывать кнопку "Перевести"</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={s.translateWholeChats && isPremium} disabled={!isPremium} onChange={(e)=>appSettingsStore.setTranslateWholeChats(e.target.checked)} />
          <span>Переводить чаты целиком</span>
          <span className="ml-2 text-white/70">{isPremium ? '✔︎' : '🔒'}</span>
        </label>
        <div className="text-white/70 text-sm">Кнопка "Перевести" появится в меню действий для сообщений, содержащих текст.</div>
      </div>

      <div className="h-px bg-white/20 mx-1" />

      {/* Interface language */}
      <div className="bg-white/10 rounded-lg p-3 space-y-2">
        <div className="font-semibold">Язык интерфейса</div>
        {s.available.map((opt) => (
          <label key={opt.code} className="flex items-center gap-2">
            <input type="radio" name="uiLang" checked={s.selected === opt.code} onChange={()=>appSettingsStore.setInterfaceLanguage(opt.code)} />
            <span>{opt.nameNative}</span>
            <span className="text-white/60 text-sm">({opt.nameRu})</span>
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
