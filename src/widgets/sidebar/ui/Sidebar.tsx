import { SearchPanel } from './SearchPanel';
import { StoriesPanel } from './StoriesPanel';
import { ChatsPanel } from './ChatsPanel';

export function Sidebar() {
  return (
    <aside className="w-[340px] border-r p-4 space-y-4">
      <SearchPanel />
      <StoriesPanel />
      <ChatsPanel />
    </aside>
  );
}
