import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pixiLegacyBundle = resolve(
  __dirname,
  'node_modules/pixi.js-legacy/dist/pixi-legacy.mjs',
);

export default defineConfig({
  resolve: {
    alias: {
      'pixi.js': pixiLegacyBundle,
      'pixi.js-legacy': pixiLegacyBundle,
    },
  },
  optimizeDeps: {
    // Absolute path — alias + 'pixi.js-legacy/dist/...' would duplicate the path segment.
    include: [pixiLegacyBundle],
    exclude: ['@rollerbird/canvaskit-wasm-pdf'],
  },
});
