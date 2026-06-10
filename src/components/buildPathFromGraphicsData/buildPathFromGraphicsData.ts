import type { CanvasKit, Path } from '@rollerbird/canvaskit-wasm-pdf';
import type { GraphicsData } from '@pixi/graphics';
import { addShapeToPath } from './utils';
import type { BuildPathOptions } from './types';

export const buildPathFromGraphicsData = (
  canvasKit: CanvasKit,
  data: GraphicsData,
  options: BuildPathOptions,
): Path => {
  const path = new canvasKit.Path();

  addShapeToPath(canvasKit, path, data, options);

  return path;
};
