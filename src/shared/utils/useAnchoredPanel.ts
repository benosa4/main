import { CSSProperties, RefObject, useLayoutEffect, useState } from 'react';

export function useAnchoredPanel(anchorRef: RefObject<HTMLElement | null>) {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setStyle({
        position: 'fixed',
        left: rect.left,
        bottom: window.innerHeight - rect.top + 8,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef]);

  return style;
}
