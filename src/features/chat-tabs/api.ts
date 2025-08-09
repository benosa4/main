export interface ChatTab {
  id: number;
  label: string;
  chatIds: number[];
}

export const fetchChatTabs = async (): Promise<ChatTab[]> => {
  const total = Array.from({ length: 50 }, (_, i) => i + 1);
  const tabs: ChatTab[] = [
    { id: 1, label: 'All', chatIds: total },
  ];
  for (let i = 2; i <= 10; i++) {
    tabs.push({
      id: i,
      label: `Tab ${i}`,
      chatIds: total.filter((id) => id % i === 0),
    });
  }
  return Promise.resolve(tabs);
};
