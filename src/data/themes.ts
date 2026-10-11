import { IsaHmiTheme } from '../types';

export const DEFAULT_THEME: IsaHmiTheme = 'isa_slate_dark';

/** Root-container background applied to every station for each theme. */
export const THEME_BACKGROUNDS: Record<IsaHmiTheme, string> = {
  isa_slate_dark: '#18181B',
  isa_day_gray: '#27272A',
  isa_night_charcoal: '#0F172A',
  clean_light: '#F4F4F5',
};

export const THEME_LABELS: Record<IsaHmiTheme, string> = {
  isa_slate_dark: 'Deep Slate Dark',
  isa_day_gray: 'Day Zinc',
  isa_night_charcoal: 'Night Charcoal',
  clean_light: 'Clean Light',
};

/** Legacy brownish-gray background that older saved projects still carry. */
export const LEGACY_BACKGROUND = '#71717A';
