import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';

declare global {
  interface Window {
    CanvasKitInit?: (opts?: { wasmBinary?: ArrayBuffer }) => Promise<CanvasKit>;
  }
}