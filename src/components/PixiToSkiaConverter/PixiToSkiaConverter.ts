import { Container } from 'pixi.js-legacy';
import type { Canvas, CanvasKit } from '@/shared/types';
import { renderDisplayObject } from './utils';

/**
 * Renders a Pixi display tree onto a Skia canvas.
 * Vector primitives (PIXI.Graphics) are drawn as paths; sprites are drawn as bitmaps.
 */
export const convertPixiContainerToSkia = async (
  canvasKit: CanvasKit,
  canvas: Canvas,
  container: Container,
): Promise<void> => {
  canvas.clear(canvasKit.Color4f(1, 1, 1, 1));

  await renderDisplayObject(canvasKit, canvas, container);
};
