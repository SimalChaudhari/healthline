import {
  SNPro_200ExtraLight,
  SNPro_300Light,
  SNPro_400Regular,
  SNPro_500Medium,
  SNPro_600SemiBold,
  SNPro_700Bold,
  SNPro_800ExtraBold,
  SNPro_900Black,
  SNPro_400Regular_Italic,
  SNPro_500Medium_Italic,
  SNPro_600SemiBold_Italic,
  SNPro_700Bold_Italic,
} from '@expo-google-fonts/sn-pro';
import { NovaRound_400Regular } from '@expo-google-fonts/nova-round';

/** Loaded font family names (use these in style.fontFamily). */
export const FONT = {
  sn: 'SNPro_400Regular',
  snLight: 'SNPro_300Light',
  snMedium: 'SNPro_500Medium',
  snSemiBold: 'SNPro_600SemiBold',
  snBold: 'SNPro_700Bold',
  snExtraBold: 'SNPro_800ExtraBold',
  snBlack: 'SNPro_900Black',
  nova: 'NovaRound_400Regular',
};

export const APP_FONT_MAP = {
  SNPro_200ExtraLight,
  SNPro_300Light,
  SNPro_400Regular,
  SNPro_500Medium,
  SNPro_600SemiBold,
  SNPro_700Bold,
  SNPro_800ExtraBold,
  SNPro_900Black,
  SNPro_400Regular_Italic,
  SNPro_500Medium_Italic,
  SNPro_600SemiBold_Italic,
  SNPro_700Bold_Italic,
  NovaRound_400Regular,
};

/** Map CSS-like fontWeight → SN Pro face. */
export function snPro(fontWeight = '400', italic = false) {
  const w = String(fontWeight);
  if (italic) {
    if (w === '700' || w === 'bold' || w === '800' || w === '900') return 'SNPro_700Bold_Italic';
    if (w === '600' || w === 'semibold') return 'SNPro_600SemiBold_Italic';
    if (w === '500' || w === 'medium') return 'SNPro_500Medium_Italic';
    return 'SNPro_400Regular_Italic';
  }
  if (w === '200' || w === '100') return 'SNPro_200ExtraLight';
  if (w === '300' || w === 'light') return 'SNPro_300Light';
  if (w === '500' || w === 'medium') return 'SNPro_500Medium';
  if (w === '600' || w === 'semibold') return 'SNPro_600SemiBold';
  if (w === '700' || w === 'bold') return 'SNPro_700Bold';
  if (w === '800') return 'SNPro_800ExtraBold';
  if (w === '900' || w === 'black') return 'SNPro_900Black';
  return 'SNPro_400Regular';
}

export const novaRound = FONT.nova;
