import type { CanvasKit, Color } from '@/shared/types';
import { COLOR_CHANNEL_MASK, COLOR_CHANNEL_MAX } from '@/shared/constants';

/** Converts Pixi 0xRRGGBB color and alpha to CanvasKit Color4f. */
export const pixiColorToSkia = (
  canvasKit: CanvasKit,
  color: number,
  alpha: number,
): Color => {
  const r = ((color >> 16) & COLOR_CHANNEL_MASK) / COLOR_CHANNEL_MAX;
  const g = ((color >> 8) & COLOR_CHANNEL_MASK) / COLOR_CHANNEL_MAX;
  const b = (color & COLOR_CHANNEL_MASK) / COLOR_CHANNEL_MAX;

  return canvasKit.Color4f(r, g, b, alpha);
};
