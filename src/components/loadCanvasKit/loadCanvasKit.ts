import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';
import { CANVASKIT_JS_URL, CANVASKIT_WASM_URL } from './constants';
import './types';

export const loadCanvasKit = async (): Promise<CanvasKit> => {
  const CanvasKitInit = window.CanvasKitInit;

  if (!CanvasKitInit) {
    throw new Error(`CanvasKitInit is not available. Check script tag in index.html: ${CANVASKIT_JS_URL}`);
  }

  const wasmResponse = await fetch(CANVASKIT_WASM_URL);

  if (!wasmResponse.ok) {
    throw new Error('Failed to load CanvasKit WASM');
  }

  const wasmBinary = await wasmResponse.arrayBuffer();

  return CanvasKitInit({ wasmBinary });
};
