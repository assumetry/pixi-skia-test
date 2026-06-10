import type { Texture } from 'pixi.js-legacy';
import type { CanvasKit, Image } from '@rollerbird/canvaskit-wasm-pdf';

export const getTextureToSkiaImage = (
  canvasKit: CanvasKit,
  texture: Texture,
): Image => {
  const source = (texture.baseTexture.resource as unknown as { source: CanvasImageSource }).source;
  const image = canvasKit.MakeImageFromCanvasImageSource(source);

  if (!image) {
    throw new Error('Failed to convert Pixi texture to Skia image');
  }

  return image;
};
