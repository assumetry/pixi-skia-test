import { Container, Sprite, Texture } from 'pixi.js-legacy';
import { PIXI_CONTAINER_HEIGHT, PIXI_CONTAINER_WIDTH } from '@/shared/constants';
import bunny from '@/shared/assets/bunny.png';

export const addSpritePng = (container: Container): Sprite => {
  const texture = Texture.from(bunny);

  const sprite = new Sprite(texture);
  sprite.eventMode = 'none';
  sprite.x = Math.floor(Math.random() * (PIXI_CONTAINER_WIDTH - 100));
  sprite.y = Math.floor(Math.random() * (PIXI_CONTAINER_HEIGHT - 100));
  sprite.scale.set(2);

  container.addChild(sprite);
  return sprite;
};
