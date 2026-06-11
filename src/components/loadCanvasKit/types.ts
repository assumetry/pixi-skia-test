import type { CanvasKit } from '@/shared/types';

declare global {
  interface Window {
    CanvasKitInit?: (opts?: { wasmBinary?: ArrayBuffer }) => Promise<CanvasKit>;
  }
}