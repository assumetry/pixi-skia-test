import { Container, Graphics } from 'pixi.js-legacy';
import { attachShapeInteractivity } from './attachShapeInteractivity';
import { addSpritePng } from './addSpritePng';
import { randomInRange } from './randomInRange';
import { DEFAULT_DEMO_MARGIN, DEFAULT_DEMO_ROUND_RECT_RADIUS, DEFAULT_DEMO_SHAPE_FILL_COLOR, DEFAULT_DEMO_SHAPE_HEIGHT, DEFAULT_DEMO_SHAPE_WIDTH, PIXI_CONTAINER_HEIGHT, PIXI_CONTAINER_WIDTH } from '../constants';

/** Builds the initial Pixi scene with interactive graphics and a sprite. */
export const createDemoScene = (
  stage: Container,
  onShapeChange: () => void,
): Container => {
  const container = new Container();
  container.eventMode = 'passive';
  container.interactiveChildren = true;
  stage.addChild(container);

  const width = DEFAULT_DEMO_SHAPE_WIDTH;
  const height = DEFAULT_DEMO_SHAPE_HEIGHT;
  const outerRadius = width / 2;

  const rect = new Graphics();
  rect.beginFill(DEFAULT_DEMO_SHAPE_FILL_COLOR);
  rect.drawRect(-width / 2, -height / 2, width, height);
  rect.drawCircle(0, 0, outerRadius);
  rect.drawRoundedRect(-width / 2, -height / 2, width, height, DEFAULT_DEMO_ROUND_RECT_RADIUS);
  rect.endFill();
  addDefaultShapeSettings(rect, onShapeChange);

  const circle = new Graphics();
  circle.beginFill(DEFAULT_DEMO_SHAPE_FILL_COLOR);
  circle.drawCircle(0, 0, outerRadius);
  circle.endFill();
  addDefaultShapeSettings(circle, onShapeChange);

  const roundRect = new Graphics();
  roundRect.beginFill(DEFAULT_DEMO_SHAPE_FILL_COLOR);
  roundRect.drawRoundedRect(-width / 2, -height / 2, width, height, DEFAULT_DEMO_ROUND_RECT_RADIUS);
  roundRect.endFill();
  addDefaultShapeSettings(roundRect, onShapeChange);

  container.addChild(rect);
  container.addChild(circle);
  container.addChild(roundRect);

  addSpritePng(container);

  return container;
};

const addDefaultShapeSettings = (shape: Graphics, onShapeChange: () => void) => {
  shape.eventMode = 'static';
  shape.cursor = 'pointer';

  shape.position.set(
    randomInRange(DEFAULT_DEMO_MARGIN, PIXI_CONTAINER_WIDTH - DEFAULT_DEMO_MARGIN),
    randomInRange(DEFAULT_DEMO_MARGIN, PIXI_CONTAINER_HEIGHT - DEFAULT_DEMO_MARGIN),
  );
  shape.rotation = randomInRange(0, Math.PI * 2);
  shape.scale.set(
    randomInRange(0.6, 1.4),
    randomInRange(0.6, 1.4),
  );

  attachShapeInteractivity(shape, DEFAULT_DEMO_SHAPE_FILL_COLOR, onShapeChange);
};