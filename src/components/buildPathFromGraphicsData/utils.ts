import { SHAPES } from '@pixi/math';
import type { Circle, Ellipse, Polygon, Rectangle, RoundedRectangle } from '@pixi/math';
import type { GraphicsData } from '@pixi/graphics';
import type { CanvasKit, PathBuilder } from '@/shared/types';
import { MIN_POLYLINE_POINT_COUNT } from './constants';
import type { BuildPathOptions } from './types';

export const shouldCloseLinePath = (data: GraphicsData): boolean => {
  return data.type === SHAPES.POLY && (data.shape as Polygon).closeStroke;
};

export const addShapeToPath = (
  canvasKit: CanvasKit,
  path: PathBuilder,
  data: GraphicsData,
  options: BuildPathOptions,
) => {
  const { shape, type, points } = data;

  switch (type) {
    case SHAPES.RECT: {
      const rect = shape as Rectangle;
      path.addRect(canvasKit.XYWHRect(rect.x, rect.y, rect.width, rect.height));
      break;
    }
    case SHAPES.CIRC: {
      const circle = shape as Circle;
      path.addCircle(circle.x, circle.y, circle.radius);
      break;
    }
    case SHAPES.ELIP: {
      const ellipse = shape as Ellipse;
      path.addOval(canvasKit.XYWHRect(
        ellipse.x - ellipse.width,
        ellipse.y - ellipse.height,
        ellipse.width * 2,
        ellipse.height * 2,
      ));
      break;
    }
    case SHAPES.RREC: {
      const roundRect = shape as RoundedRectangle;
      path.addRRect(canvasKit.RRectXY(
        canvasKit.XYWHRect(roundRect.x, roundRect.y, roundRect.width, roundRect.height),
        roundRect.radius,
        roundRect.radius,
      ));
      break;
    }
    case SHAPES.POLY: {
      const polygon = shape as Polygon;
      const polylinePoints = points.length > 0 ? points : polygon.points;

      if (polylinePoints.length < MIN_POLYLINE_POINT_COUNT) {
        return;
      }

      path.addPolygon(polylinePoints, options.closePath);
      break;
    }
  }
};
