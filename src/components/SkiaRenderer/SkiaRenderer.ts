import type { Container } from 'pixi.js-legacy';
import type { Surface } from '@rollerbird/canvaskit-wasm-pdf';
import { convertPixiContainerToSkia } from '../PixiToSkiaConverter';
import { SKIA_CANVAS_ID } from './constants';
import type { SkiaRendererHandle, SkiaRendererOptions } from './types';

export const createSkiaRenderer = (options: SkiaRendererOptions): SkiaRendererHandle => {
  const { canvasKit, width, height } = options;

  const canvasElement = document.createElement('canvas');
  canvasElement.width = width;
  canvasElement.height = height;
  canvasElement.id = SKIA_CANVAS_ID;

  let surface: Surface | null = canvasKit.MakeSWCanvasSurface(canvasElement);

  const render = async (container: Container) => {
    if (!surface) {
      return;
    }

    const canvas = surface.getCanvas();

    await convertPixiContainerToSkia(canvasKit, canvas, container);

    surface.flush();
  };

  const dispose = () => {
    surface?.delete();
    surface = null;
  };

  return { canvasElement, render, dispose };
};
