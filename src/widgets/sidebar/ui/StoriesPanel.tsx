import { observer } from 'mobx-react-lite';
import { useStories } from '../../../features/stories/hooks';
import { lightTokens } from '../../../shared/config/tokens';

export const StoriesPanel = observer(() => {
  const storyStore = useStories();
  const TOKENS = lightTokens;

  if (storyStore.stories.length === 0) {
    return (
      <div
        className="p-3 border-b"
        style={{ borderColor: TOKENS.color['border.muted'] as string }}
      >
        <div className="text-neutral-500">No stories</div>
      </div>
    );
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto hide-scrollbar px-3 py-2 border-b"
      style={{
        background: TOKENS.color['bg.story.strip'] as string,
        borderColor: TOKENS.color['border.muted'] as string,
      }}
    >
      {storyStore.stories.map((story) => {
        const ringGradient = `linear-gradient(135deg, ${TOKENS.color['bg.story.ring.start']}, ${TOKENS.color['bg.story.ring.end']})`;
        return (
          <div
            key={story.id}
            className="flex flex-col items-center w-[64px] shrink-0"
          >
            <div
              className="w-[64px] h-[64px] rounded-full p-[3px]"
              style={{ background: ringGradient }}
            >
              <div
                className="w-full h-full rounded-full p-[2px]"
                style={{ background: '#fff' }}
              >
                <img
                  src={story.avatar}
                  alt={story.title}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span
              className="text-[12px] mt-1 truncate w-full text-center"
              style={{ color: TOKENS.color['text.secondary'] as string }}
            >
              {story.title}
            </span>
          </div>
        );
      })}
    </div>
  );
});

