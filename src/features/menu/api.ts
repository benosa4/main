export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  children?: MenuItem[];
}

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  return Promise.resolve([
    { id: 'user', icon: '👤', label: 'Имя пользователя' },
    { id: 'add', icon: '➕', label: '+ добавить аккаунт' },
    { id: 'saved', icon: '💾', label: 'Сохраненные сообщения' },
    { id: 'stories', icon: '📚', label: 'Мои истории' },
    { id: 'contacts', icon: '👥', label: 'Сонтакты' },
    { id: 'wallet', icon: '💼', label: 'Кошелек' },
    { id: 'settings', icon: '⚙️', label: 'Настройки' },
    {
      id: 'more',
      icon: '⋯',
      label: 'Еще..',
      children: [
        { id: 'dark', icon: '🌙', label: 'Включить темный режим' },
        { id: 'anim', icon: '🚫', label: 'Выключить анимацию' },
        { id: 'version', icon: '🔄', label: 'Переключить в А версию' },
        { id: 'features', icon: '⭐', label: 'Телеграм фичи' },
        { id: 'bug', icon: '🐞', label: 'Сообщить об ошибке' },
        { id: 'install', icon: '⬇️', label: 'Установить приложение' }
      ]
    }
  ]);
};
