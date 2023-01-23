import { resolve } from 'path';
import { defineConfig } from 'vite';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');

export default defineConfig({
  base: 'espeon',
  root,
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        ajuda: resolve(root, 'ajuda', 'index.html'),
        deck: resolve(root, 'deck', 'index.html'),
      },
    },
    outDir,
  },
});
