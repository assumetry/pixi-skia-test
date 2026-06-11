import type { GraphicsData } from '@pixi/graphics';
import type { CanvasKit, Path } from '@/shared/types';
import { addShapeToPath } from './utils';
import type { BuildPathOptions } from './types';

export const buildPathFromGraphicsData = (
  canvasKit: CanvasKit,
  data: GraphicsData,
  options: BuildPathOptions,
): Path => {
  const builder = new canvasKit.PathBuilder();
  addShapeToPath(canvasKit, builder, data, options);
  return builder.snapshot();
};
