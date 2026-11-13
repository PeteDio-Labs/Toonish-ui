// Config for the package's own build of dist/toonish.css: base rules and components only. Tailwind v3 emits a
// component class only when the content scan finds it, so the safelist forces every toon-* class out. Preflight
// stays off, so the file never resets a consumer's page.
import type { Config } from 'tailwindcss';
import preset from './src/preset.ts';

export default {
  presets: [preset as Partial<Config>],
  content: [],
  safelist: [{ pattern: /^toon-/ }],
  corePlugins: { preflight: false },
} satisfies Config;
