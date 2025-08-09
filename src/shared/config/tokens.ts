export type DesignTokens = {
  color: Record<string, string | number>;
  radius: Record<string, number>;
  space: Record<string, number>;
  font: Record<string, string | number>;
  elevation: Record<string, string>;
};

export const lightTokens: DesignTokens = {
  color: {
    'bg.app': '#FFFFFF',
    'bg.sidebar': '#F4F4F4',
    'bg.sidebar.active': '#D2EDFF',
    'bg.chat': 'linear-gradient(180deg,#E1F6E1 0%,#C4EBC4 100%)',
    'bg.chat.pattern.opacity': 0.18 as unknown as string,
    'bg.header': '#FFFFFF',
    'bg.search': '#FFFFFF',
    'bg.story.strip': 'transparent',
    'bg.story.ring.start': '#2AABEE',
    'bg.story.ring.end': '#229ED9',
    'bg.message.in': '#FFFFFF',
    'bg.message.out': '#E2FDD6',
    'bg.input': '#F4F4F4',
    'bg.unread.badge': '#3390EC',
    'bg.selection': 'rgba(0,136,204,0.08)',
    'border.muted': '#E6E6E6',
    'border.message': '#EDEDED',
    'text.primary': '#111315',
    'text.secondary': '#6B6F76',
    'text.muted': '#9AA0A6',
    'text.link': '#0A7ACE',
    'text.inverse': '#FFFFFF',
    'icon.normal': '#6B6F76',
    'icon.accent': '#3390EC',
    shadow: 'rgba(17,19,21,0.08)'
  },
  radius: { xs: 6, sm: 8, md: 12, lg: 16, xl: 20 },
  space: { xxs: 4, xs: 6, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  font: {
    family: `-apple-system, Segoe UI, Roboto, Arial, sans-serif`,
    'size.body': 14,
    'size.meta': 12,
    'size.title': 16,
    'weight.normal': 400,
    'weight.semibold': 600,
    'weight.bold': 700
  },
  elevation: {
    card: '0 1px 2px rgba(17,19,21,0.06)',
    float: '0 8px 24px rgba(17,19,21,0.12)'
  }
};

// Minimal dark mapping (keeps our previous dark feel; can be refined)
export const darkTokens: DesignTokens = {
  ...lightTokens,
  color: {
    ...lightTokens.color,
    'bg.app': '#111214',
    'bg.sidebar': '#1C1D20',
    'bg.sidebar.active': '#2A2D33',
    'bg.chat': 'linear-gradient(180deg,#1E2A22 0%,#16231A 100%)',
    'bg.header': '#1C1D20',
    'bg.search': '#22242A',
    'bg.story.strip': 'transparent',
    'bg.message.in': '#1F2024',
    'bg.message.out': '#2E3A2C',
    'bg.input': '#22242A',
    'border.muted': '#2E3136',
    'border.message': '#2A2D33',
    'text.primary': '#FFFFFF',
    'text.secondary': '#A8AEB6',
    'text.muted': '#8A9098',
    'icon.normal': '#A8AEB6',
    'icon.accent': '#77A8FF',
    shadow: 'rgba(0,0,0,0.35)'
  }
};

