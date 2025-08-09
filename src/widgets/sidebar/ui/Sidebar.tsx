import { SearchPanel } from './SearchPanel';
import { StoriesPanel } from './StoriesPanel';
import { ChatsPanel } from './ChatsPanel';
import { lightTokens } from '../../../shared/config/tokens';

export function Sidebar() {
  const TOKENS = lightTokens;

  return (
    <aside
      className="flex flex-col relative border-r"
      style={{
        width: 340,
        background: TOKENS.color['bg.sidebar'] as string,
        borderColor: TOKENS.color['border.muted'] as string,
      }}
    >
      <SearchPanel />
      <StoriesPanel />
      <ChatsPanel />
    </aside>
  );
}

