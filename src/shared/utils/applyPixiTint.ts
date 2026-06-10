import { COLOR_CHANNEL_MASK, COLOR_CHANNEL_MAX } from '../constants';

/** Multiplies Pixi fill color by a Graphics/Sprite tint (0xRRGGBB). */
export const applyPixiTint = (color: number, tint: number): number => {
  const r = (((color >> 16) & COLOR_CHANNEL_MASK) * ((tint >> 16) & COLOR_CHANNEL_MASK)) / COLOR_CHANNEL_MAX;
  const g = (((color >> 8) & COLOR_CHANNEL_MASK) * ((tint >> 8) & COLOR_CHANNEL_MASK)) / COLOR_CHANNEL_MAX;
  const b = ((color & COLOR_CHANNEL_MASK) * (tint & COLOR_CHANNEL_MASK)) / COLOR_CHANNEL_MAX;

  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
};
