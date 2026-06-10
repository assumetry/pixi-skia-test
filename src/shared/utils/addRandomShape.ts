import { Container, Graphics } from 'pixi.js-legacy';
import { attachShapeInteractivity } from './attachShapeInteractivity';
import { PIXI_CONTAINER_HEIGHT, PIXI_CONTAINER_WIDTH } from '../constants';
import { randomColor } from './randomColor';

/** Adds a random PIXI.Graphics shape (rectangle, circle, ellipse, or polyline) to the container. */
export const addRandomShape = (
  container: Container,
  onShapeChange: () => void,
): Graphics => {
  const graphics = new Graphics();
  graphics.eventMode = 'static';
  graphics.cursor = 'pointer';

  const color = randomColor();
  const shapeType = Math.floor(Math.random() * 5);
  const maxX = PIXI_CONTAINER_WIDTH - 120;
  const maxY = PIXI_CONTAINER_HEIGHT - 120;
  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  switch (shapeType) {
    case 0:
      graphics.beginFill(color);
      graphics.drawRect(x, y, 40 + Math.random() * 80, 30 + Math.random() * 70);
      graphics.endFill();

      break;
    case 1:
      graphics.beginFill(color);
      graphics.drawCircle(x + 40, y + 40, 20 + Math.random() * 40);
      graphics.endFill();

      break;
    case 2:
      graphics.beginFill(color);
      graphics.drawEllipse(x + 50, y + 35, 30 + Math.random() * 40, 20 + Math.random() * 30);
      graphics.endFill();

      break;
    case 3:
      graphics.beginFill(color);
      graphics.drawPolygon([
        x, y,
        x + 80, y + 10,
        x + 60, y + 70,
        x + 10, y + 50,
      ]);
      graphics.endFill();

      break;
    case 4:
      graphics.lineStyle(2 + Math.random() * 4, color, 1);
      graphics.moveTo(x, y);
      graphics.lineTo(x + 40 + Math.random() * 120, y + 10 + Math.random() * 80);
      graphics.lineTo(x + 20 + Math.random() * 100, y + 60 + Math.random() * 100);

      break;
  }

  attachShapeInteractivity(graphics, color, onShapeChange);
  container.addChild(graphics);

  return graphics;
};
