import { resolve } from 'path';
import { defineConfig } from 'vite';

const outDir = resolve(__dirname, 'dist');

export default defineConfig({
  base: '/espeon/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        help: 'help.html',
        deck: 'deck.html',
      },
    },
    outDir,
  },
});
