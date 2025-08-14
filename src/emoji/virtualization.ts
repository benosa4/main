import { useEffect, useRef, useState } from 'react';

export function toRows<T>(items: readonly T[], cols: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols));
  }
  return rows;
}

export function useGridColumns(cellSize: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setCols(Math.max(1, Math.floor(width / cellSize)));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [cellSize]);
  return { ref, cols };
}
