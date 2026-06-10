import type { Graphics } from 'pixi.js-legacy';
import { randomColor } from './randomColor';

export const attachShapeInteractivity = (
  graphics: Graphics,
  baseColor: number,
  onChange: () => void,
) => {
  let pressed = false;

  graphics.on('pointerdown', () => {
    pressed = true;
    graphics.alpha = 0.6;

    onChange();
  });

  graphics.on('pointerup', () => {
    if (!pressed) {
      return;
    }

    pressed = false;
    graphics.alpha = 1;
    graphics.tint = randomColor() ^ baseColor;

    onChange();
  });

  graphics.on('pointerupoutside', () => {
    pressed = false;
    graphics.alpha = 1;

    onChange();
  });
};
