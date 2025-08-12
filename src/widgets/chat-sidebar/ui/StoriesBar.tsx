import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { storyStore } from '../../../features/stories/model';
import appSettingsStore from '../../../shared/config/appSettings';

const StoriesBar = observer(() => {
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    const handle = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', handle, { passive: false });
    return () => el.removeEventListener('wheel', handle);
  }, []);

  const t = appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.interface.menuTransitions;
  return (
    <div
      ref={storyRef}
      className={`flex gap-4 overflow-x-auto hide-scrollbar h-24 p-2 opacity-100 border-b border-white/20 ${t ? 'transition-all duration-300' : ''}`}
    >
      {storyStore.stories.map((story) => {
        const total = story.segments.length;
        const step = 100 / total;
        const gradient = story.segments
          .map((seg, idx) => {
            const start = idx * step;
            const end = start + step;
            const color = seg.viewed ? '#9ca3af' : '#3b82f6';
            return `${color} ${start}% ${end}%`;
          })
          .join(', ');

        return (
          <div key={story.id} className="flex flex-col items-center w-14 shrink-0">
            <div
              className="w-14 h-14 rounded-full p-[4px]"
              style={{ background: `conic-gradient(${gradient})` }}
            >
              <div className="w-full h-full rounded-full p-[2px] bg-white/20">
                <img
                  src={story.avatar}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs mt-1">{story.title}</span>
          </div>
        );
      })}
    </div>
  );
});

export default StoriesBar;
