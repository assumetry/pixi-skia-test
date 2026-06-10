import {
  Container,
  Graphics,
  Sprite,
} from 'pixi.js-legacy';
import type { GraphicsData } from '@pixi/graphics';
import type { Canvas, CanvasKit, Paint, Path } from '@rollerbird/canvaskit-wasm-pdf';
import { applyPixiTint } from '../../shared/utils/applyPixiTint';
import { pixiColorToSkia } from '../../shared/utils/pixiColorToSkia';
import { buildPathFromGraphicsData, shouldCloseLinePath } from '../buildPathFromGraphicsData';
import { getTextureToSkiaImage } from '../getTextureToSkiaImage';

export const renderDisplayObject = async (
  canvasKit: CanvasKit,
  canvas: Canvas,
  displayObject: Container,
): Promise<void> => {
  canvas.save();

  const matrix = displayObject.worldTransform;
  canvas.concat([
    matrix.a, matrix.c, matrix.tx,
    matrix.b, matrix.d, matrix.ty,
    0, 0, 1,
  ]);

  if (displayObject instanceof Graphics) {
    const { graphicsData } = displayObject.geometry;

    for (const data of graphicsData) {
      drawGraphicsData(canvasKit, canvas, data, displayObject);
    }
  }

  if (displayObject instanceof Sprite) {
    await drawSprite(canvasKit, canvas, displayObject);
  }

  canvas.restore();

  for (const child of displayObject.children) {
    await renderDisplayObject(canvasKit, canvas, child as Container);
  }
};

const drawGraphicsData = (
  canvasKit: CanvasKit,
  canvas: Canvas,
  data: GraphicsData,
  graphics: Graphics,
) => {
  const hasFill = data.fillStyle.visible;
  const hasStroke = data.lineStyle.visible && data.lineStyle.width > 0;

  if (!hasFill && !hasStroke) {
    return;
  }

  const path = buildPathFromGraphicsData(canvasKit, data, {
    closePath: shouldCloseLinePath(data),
  });

  if (hasFill) {
    drawPathWithPaint(canvas, path, createFillPaint(canvasKit, data, graphics));
  }

  if (hasStroke) {
    drawPathWithPaint(canvas, path, createStrokePaint(canvasKit, data, graphics));
  }

  path.delete();
};

const drawPathWithPaint = (canvas: Canvas, path: Path, paint: Paint) => {
  canvas.drawPath(path, paint);
  paint.delete();
};

const createFillPaint = (
  canvasKit: CanvasKit,
  data: GraphicsData,
  graphics: Graphics,
): Paint => {
  const paint = new canvasKit.Paint();
  const color = applyPixiTint(data.fillStyle.color, graphics.tint);
  const alpha = data.fillStyle.alpha * graphics.worldAlpha;

  paint.setStyle(canvasKit.PaintStyle.Fill);
  paint.setColor(pixiColorToSkia(canvasKit, color, alpha));
  paint.setAntiAlias(true);

  return paint;
};

const createStrokePaint = (
  canvasKit: CanvasKit,
  data: GraphicsData,
  graphics: Graphics,
): Paint => {
  const paint = new canvasKit.Paint();
  const color = applyPixiTint(data.lineStyle.color, graphics.tint);
  const alpha = data.lineStyle.alpha * graphics.worldAlpha;

  paint.setStyle(canvasKit.PaintStyle.Stroke);
  paint.setColor(pixiColorToSkia(canvasKit, color, alpha));
  paint.setStrokeWidth(data.lineStyle.width);
  paint.setAntiAlias(true);

  return paint;
};

const drawSprite = async (
  canvasKit: CanvasKit,
  canvas: Canvas,
  sprite: Sprite,
): Promise<void> => {
  const image = getTextureToSkiaImage(canvasKit, sprite.texture);
  const paint = new canvasKit.Paint();

  paint.setAntiAlias(true);
  paint.setAlphaf(sprite.alpha);

  const frame = sprite.texture.frame;
  const sourceRect = canvasKit.XYWHRect(frame.x, frame.y, frame.width, frame.height);
  const destinationRect = canvasKit.XYWHRect(
    -sprite.anchor.x * frame.width,
    -sprite.anchor.y * frame.height,
    frame.width,
    frame.height,
  );

  canvas.drawImageRect(image, sourceRect, destinationRect, paint);

  paint.delete();
};
