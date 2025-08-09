import { observer } from 'mobx-react-lite';
import { storyStore } from '../../../features/stories/model';

export const StoriesPanel = observer(() => {
  return (
    <div className="mb-4">
      {storyStore.stories.length === 0 ? (
        <div className="text-neutral-500">No stories</div>
      ) : (
        <ul className="flex space-x-2 overflow-x-auto">
          {storyStore.stories.map((story) => (
            <li key={story.id}>
              <img
                src={story.avatar}
                alt={story.title}
                className="h-12 w-12 rounded-full"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
