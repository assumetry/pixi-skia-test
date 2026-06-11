import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

const pixiLegacyBundle = resolve(
  rootDir,
  'node_modules/pixi.js-legacy/dist/pixi-legacy.mjs',
);

export default defineConfig({
  base: '/pixi-skia-test/',
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
      'pixi.js': pixiLegacyBundle,
      'pixi.js-legacy': pixiLegacyBundle,
    },
  },
  optimizeDeps: {
    include: [pixiLegacyBundle],
  },
});
