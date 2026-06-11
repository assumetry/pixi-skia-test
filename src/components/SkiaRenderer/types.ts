import type { Container } from 'pixi.js-legacy';
import type { CanvasKit } from '@/shared/types';

export interface SkiaRendererOptions {
  canvasKit: CanvasKit;
  width: number;
  height: number;
}

export interface SkiaRendererHandle {
  canvasElement: HTMLCanvasElement;
  render: (container: Container) => Promise<void>;
  dispose: () => void;
}
