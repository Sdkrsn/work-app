export type Mode = 'work' | 'personal';
export type Scheme = 'light' | 'dark';

export interface Palette {
  bg: string;
  bgGradient: [string, string];
  surface: string;
  surfaceGlass: string;
  glassBorder: string;
  deep: string;
  deepText: string;
  deepSub: string;
  deepHairline: string;
  text: string;
  textOnBg: string;
  sub: string;
  subOnBg: string;
  hairline: string;
  hairlineOnBg: string;
  pill: string;
  pillText: string;
  accent: string;
  accentOn: string;
  accentSoft: string;
  barAccent: string;
  nitro: string;
  navBg: string;
  cardShadow: string;
  waveLine: string;
  holiday: string;
  leave: string;
  deadline: string;
  success: string;
  danger: string;
}

const workLight: Palette = {
  bg: '#141C10',
  bgGradient: ['#283A1C', '#0A0D07'],
  surface: '#FFFFFF',
  surfaceGlass: '#FFFFFF',
  glassBorder: 'transparent',
  deep: '#1D2216',
  deepText: '#FFFFFF',
  deepSub: '#9AA38A',
  deepHairline: 'rgba(255,255,255,0.1)',
  text: '#14170F',
  textOnBg: '#FFFFFF',
  sub: '#6E7266',
  subOnBg: '#9BA38C',
  hairline: '#F0F1EA',
  hairlineOnBg: 'rgba(255,255,255,0.1)',
  pill: '#262B1E',
  pillText: '#FFFFFF',
  accent: '#D7FF3D',
  accentOn: '#14170F',
  accentSoft: 'rgba(215,255,61,0.18)',
  barAccent: '#D7FF3D',
  nitro: '#D7FF3D',
  navBg: '#14170F',
  cardShadow: 'transparent',
  waveLine: 'transparent',
  holiday: '#E0665C',
  leave: '#6FA8D9',
  deadline: '#D9A545',
  success: '#4FB87F',
  danger: '#E0665C',
};

const workDark: Palette = {
  bg: '#000000',
  bgGradient: ['#000000', '#000000'],
  surface: 'rgba(30,30,34,0.6)',
  surfaceGlass: 'rgba(30,30,34,0.6)',
  glassBorder: 'rgba(255,255,255,0.08)',
  deep: '#17171A',
  deepText: '#FFFFFF',
  deepSub: '#9A9A9E',
  deepHairline: '#2C2C2E',
  text: '#FFFFFF',
  textOnBg: '#FFFFFF',
  sub: '#8E8E93',
  subOnBg: '#8E8E93',
  hairline: '#2C2C2E',
  hairlineOnBg: '#1F1F21',
  pill: '#1C1C1E',
  pillText: '#FFFFFF',
  accent: '#FFFFFF',
  accentOn: '#000000',
  accentSoft: 'rgba(255,255,255,0.12)',
  barAccent: '#9B6BFF',
  nitro: '#CFFF2E',
  navBg: '#000000',
  cardShadow: 'transparent',
  waveLine: 'transparent',
  holiday: '#FF6B6B',
  leave: '#7FB8FF',
  deadline: '#FFB020',
  success: '#34C759',
  danger: '#FF453A',
};

export const palettes: Record<Mode, Record<Scheme, Palette>> = {
  work: { light: workLight, dark: workDark },
  personal: {
    light: { ...workLight },
    dark: { ...workDark },
  },
};
