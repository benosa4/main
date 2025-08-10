export function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(d, today)) return 'Сегодня';
  if (isSameDay(d, yesterday)) return 'Вчера';
  return d.toLocaleDateString();
}

export function groupByDate<T extends { createdAt: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const it of items) {
    const key = new Date(it.createdAt).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  const groups = Array.from(map.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([key, arr]) => ({ key, label: formatDateLabel(arr[0].createdAt), items: arr.sort((x, y) => x.createdAt.localeCompare(y.createdAt)) }));
  return groups;
}

