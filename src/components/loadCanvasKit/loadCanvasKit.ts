import type { CanvasKit } from '@/shared/types';
import { CANVASKIT_WASM_URL } from './constants';
import './types';

export const loadCanvasKit = async (): Promise<CanvasKit> => {
  const CanvasKitInit = window.CanvasKitInit;

  if (!CanvasKitInit) {
    throw new Error('CanvasKitInit is not available');
  }

  const wasmResponse = await fetch(CANVASKIT_WASM_URL);

  if (!wasmResponse.ok) {
    throw new Error('Failed to load CanvasKit WASM');
  }

  const wasmBinary = await wasmResponse.arrayBuffer();

  return CanvasKitInit({ wasmBinary });
};
