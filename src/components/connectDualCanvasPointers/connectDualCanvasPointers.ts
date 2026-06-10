import { Application } from 'pixi.js-legacy';
import { dispatchSkiaPointerEvent } from './utils';
import { POINTER_DOWN_EVENT, POINTER_UP_EVENT } from './constants';

/**
 * Bridges pointer events from the Skia canvas to Pixi's federated event system.
 * Returns a cleanup function that removes the listeners.
 */
export const connectDualCanvasPointers = (
  app: Application,
  skiaCanvas: HTMLCanvasElement,
) => {
  const onPointerDown = (event: PointerEvent) => {
    dispatchSkiaPointerEvent(app, skiaCanvas, POINTER_DOWN_EVENT, event);
  };
  const onPointerUp = (event: PointerEvent) => {
    dispatchSkiaPointerEvent(app, skiaCanvas, POINTER_UP_EVENT, event);
  };

  skiaCanvas.addEventListener(POINTER_DOWN_EVENT, onPointerDown);
  skiaCanvas.addEventListener(POINTER_UP_EVENT, onPointerUp);

  return () => {
    skiaCanvas.removeEventListener(POINTER_DOWN_EVENT, onPointerDown);
    skiaCanvas.removeEventListener(POINTER_UP_EVENT, onPointerUp);
  };
};
