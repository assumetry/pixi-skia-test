import { Application, DisplayObject, Point, type IPointData } from 'pixi.js-legacy';
import type { PointerEventType, ScenePoint } from './types';

export const mapClientToScene = (
  skiaCanvas: HTMLCanvasElement,
  nativeEvent: PointerEvent,
): ScenePoint => {
  const rect = skiaCanvas.getBoundingClientRect();
  const scaleX = skiaCanvas.width / rect.width;
  const scaleY = skiaCanvas.height / rect.height;

  return {
    x: (nativeEvent.clientX - rect.left) * scaleX,
    y: (nativeEvent.clientY - rect.top) * scaleY,
  };
};

export const dispatchSkiaPointerEvent = (
  app: Application,
  skiaCanvas: HTMLCanvasElement,
  type: PointerEventType,
  nativeEvent: PointerEvent,
) => {
  const { x, y } = mapClientToScene(skiaCanvas, nativeEvent);
  const boundary = app.renderer.events.rootBoundary;
  boundary.rootTarget = app.stage;

  const target = boundary.hitTest(x, y);

  if (!target?.isInteractive()) {
    return;
  }

  const federatedEvent = {
    type,
    pointerId: nativeEvent.pointerId,
    button: nativeEvent.button,
    pressure: nativeEvent.pressure,
    tangentialPressure: nativeEvent.tangentialPressure,
    tiltX: nativeEvent.tiltX,
    tiltY: nativeEvent.tiltY,
    twist: nativeEvent.twist,
    width: nativeEvent.width,
    height: nativeEvent.height,
    isPrimary: nativeEvent.isPrimary,
    pointerType: nativeEvent.pointerType,
    clientX: nativeEvent.clientX,
    clientY: nativeEvent.clientY,
    global: { x, y },
    getLocalPosition: (displayObject: DisplayObject, point?: Point, globalPos?: IPointData) =>
      displayObject.toLocal(globalPos ?? { x, y }, undefined, point),
    stopPropagation: () => undefined,
    preventDefault: () => nativeEvent.preventDefault(),
    originalEvent: nativeEvent,
  };

  target.emit(type, federatedEvent as never);
};
