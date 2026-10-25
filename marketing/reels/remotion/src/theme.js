import {loadFont as loadSerif} from '@remotion/google-fonts/Newsreader';
import {loadFont as loadSans} from '@remotion/google-fonts/SchibstedGrotesk';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';

// Same families as the site (src/app/layout.tsx).
export const serif = loadSerif('normal', {weights: ['500', '600', '700'], subsets: ['latin']}).fontFamily;
loadSerif('italic', {weights: ['500'], subsets: ['latin']});
export const sans = loadSans('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']}).fontFamily;
export const mono = loadMono('normal', {weights: ['500'], subsets: ['latin']}).fontFamily;

// UI tokens from tailwind.config.ts / docs/design-system.md, plus the brand.* logo colors.
export const C = {
  paper: '#F8F4EB',
  paperLight: '#FCFAF5',
  paperWarm: '#F1EADC',
  paperDeep: '#EAE0CD',
  card: '#FFFDF8',
  ink: '#29322C',
  ink2: '#414A43',
  muted: '#5B635C',
  rule: '#E4DACA',
  ruleStrong: '#C8B99F',
  terra: '#BC7254',
  terraDeep: '#9A4E30',
  terraSoft: '#F6E4DA',
  honey: '#EFCB77',
  honeyDeep: '#E0B456',
  honeySoft: '#FAEFD2',
  sage: '#98AA92',
  sageDeep: '#4A6145',
  sageSoft: '#E9EEE5',
  forest: '#1F4D37',
  brandTerra: '#C75E3D',
  brandHoney: '#F6C343',
  cream: '#F8F4EB',
  // Illustration-only colors
  fabric: '#D9C8AB',
  fabricShade: '#C7B392',
  fabricLight: '#E6D8BF',
  coffee: '#7A4826',
  coffeeDark: '#5A3218',
};
