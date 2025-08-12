import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useChats } from '../../../features/chats/hooks';
import { useChatTabs } from '../../../features/chat-tabs/hooks';
import { useMenu } from '../../../features/menu/hooks';
import { useStories } from '../../../features/stories/hooks';
import SearchBar from './SearchBar';
import StoriesBar from './StoriesBar';
import ChatsPanel from './ChatsPanel';
import SettingsPanel from '../../settings-panel/ui/SettingsPanel';

const ChatSidebar = observer(() => {
  useChats();
  useMenu();
  useStories();
  useChatTabs();

  const [search, setSearch] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [storiesCollapsed, setStoriesCollapsed] = useState(false);

  return (
    <aside className="w-1/4 bg-white/20 backdrop-blur-md border-r border-white/20 flex flex-col relative">
      <SearchBar search={search} onSearch={setSearch} storiesCollapsed={storiesCollapsed} />
      <div className={`${storiesCollapsed ? 'h-0 p-0 opacity-0 border-b-0' : ''} transition-all duration-300`}>
        {!storiesCollapsed && <StoriesBar />}
      </div>
      <ChatsPanel search={search} onStoriesCollapseChange={setStoriesCollapsed} />
      {/* Settings overlay */}
      <SettingsPanel />
      <button
        onClick={() => setFabOpen((v) => !v)}
        className="absolute bottom-4 right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl cursor-pointer"
      >
        ✏️
      </button>
      {fabOpen && (
        <div className="absolute bottom-16 right-4 w-48 bg-white text-black border border-gray-200 rounded-lg shadow-lg p-2 flex flex-col gap-2">
          {[
            { id: 'newChannel', icon: '📢', label: 'Новый канал' },
            { id: 'newGroup', icon: '👥', label: 'Новая группа' },
            { id: 'newPrivate', icon: '🔒', label: 'Новый частный канал' }
          ].map((opt) => (
            <div
              key={opt.id}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer"
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
});

export default ChatSidebar;
