// The Tailwind v3 preset. Every value except the keyframes is read from tokens/toonish.tokens.json.
import { group } from './tokens.ts';

const bob = { '0%,60%,100%': { transform: 'translateY(0)' }, '30%': { transform: 'translateY(-.12em) rotate(-3deg)' } };
const squash = {
  '0%,100%': { transform: 'scale(1,1)' },
  '20%': { transform: 'scale(1.06,.92)' },
  '45%': { transform: 'translateY(-10px) scale(.96,1.06)' },
};
const pop = { '0%': { transform: 'scale(.6)', opacity: '0' }, '70%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)', opacity: '1' } };

const shadows = group('shadow');
const fonts = { ...group('font.size'), ...group('font.fluid') };

const preset = {
  theme: {
    extend: {
      colors: { toon: group('color') },
      fontFamily: Object.fromEntries(Object.entries(group('font.family')).map(([k, v]) => [k, v.split(', ')])),
      // House type scale (11 / 12 / 13 / 15 / 17 / 20 / 22 / 28) plus the fluid display sizes.
      fontSize: fonts,
      spacing: group('space'),
      borderRadius: group('radius'),
      borderWidth: group('border'),
      boxShadow: Object.fromEntries(Object.entries(shadows).map(([k, v]) => [`toon-${k}`, v])),
      transitionTimingFunction: group('ease'),
      transitionDuration: group('duration'),
      keyframes: { bob, squash, pop },
      animation: {
        bob: 'bob 2.4s cubic-bezier(.34,1.8,.5,1) infinite',
        squash: 'squash 2.2s cubic-bezier(.34,1.8,.5,1) infinite',
        pop: 'pop .5s cubic-bezier(.34,1.8,.5,1) both',
      },
    },
  },
};

export default preset;
