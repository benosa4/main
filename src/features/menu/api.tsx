import type { ReactNode } from 'react';
import {
  User,
  Plus,
  Bookmark,
  BookOpen,
  Users,
  Wallet,
  Settings,
  MoreHorizontal,
  Moon,
  Ban,
  RefreshCw,
  Star,
  Bug,
  Download,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  children?: MenuItem[];
}

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  return Promise.resolve([
    { id: 'user', icon: <User className="w-4 h-4" />, label: 'Имя пользователя' },
    { id: 'add', icon: <Plus className="w-4 h-4" />, label: '+ добавить аккаунт' },
    { id: 'saved', icon: <Bookmark className="w-4 h-4" />, label: 'Сохраненные сообщения' },
    { id: 'stories', icon: <BookOpen className="w-4 h-4" />, label: 'Мои истории' },
    { id: 'contacts', icon: <Users className="w-4 h-4" />, label: 'Сонтакты' },
    { id: 'wallet', icon: <Wallet className="w-4 h-4" />, label: 'Кошелек' },
    { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Настройки' },
    {
      id: 'more',
      icon: <MoreHorizontal className="w-4 h-4" />,
      label: 'Еще..',
      children: [
        { id: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Включить темный режим' },
        { id: 'anim', icon: <Ban className="w-4 h-4" />, label: 'Выключить анимацию' },
        { id: 'version', icon: <RefreshCw className="w-4 h-4" />, label: 'Переключить в А версию' },
        { id: 'features', icon: <Star className="w-4 h-4" />, label: 'Телеграм фичи' },
        { id: 'bug', icon: <Bug className="w-4 h-4" />, label: 'Сообщить об ошибке' },
        { id: 'install', icon: <Download className="w-4 h-4" />, label: 'Установить приложение' },
      ],
    },
  ]);
};
