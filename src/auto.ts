// Entry for dist/toonish.js: run the behaviour as soon as the DOM is ready.
import { initToonish } from './behaviour.ts';

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initToonish());
else initToonish();
