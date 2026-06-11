import './style.css';
import { Application } from 'pixi.js-legacy';
import { connectDualCanvasPointers } from '@/components/connectDualCanvasPointers';
import {
  APP_ROOT_ID,
  DEMO_PDF_FILENAME,
  PIXI_CONTAINER_HEIGHT,
  PIXI_CONTAINER_WIDTH,
  PIXI_HOST_ID,
  SKIA_HOST_ID,
  DEFAULT_SCENE_BACKGROUND_COLOR,
} from '@/shared/constants';
import { getExportPdfButton, getShapeButton, getStatusLabel } from '@/shared/ui';
import { addRandomShape, createDemoScene } from '@/shared/utils';
import { loadCanvasKit } from '@/components/loadCanvasKit';
import { downloadPdf } from '@/components/downloadPdf';
import { exportPixiContainerToPdf } from '@/components/exportPixiContainerToPdf';
import { createSkiaRenderer } from '@/components/SkiaRenderer';
const run = async (): Promise<void> => {
  // Getting ui elements
  const randomShapeButton = getShapeButton();
  const exportPdfButton = getExportPdfButton();
  const statusLabel = getStatusLabel();
  const pixiHost = document.getElementById(PIXI_HOST_ID);
  const skiaHost = document.getElementById(SKIA_HOST_ID);

  const isLabelExists = statusLabel instanceof HTMLParagraphElement;
  const randomShapeButtonExists = randomShapeButton instanceof HTMLButtonElement;
  const exportPdfButtonExists = exportPdfButton instanceof HTMLButtonElement;
  const pixiHostExists = pixiHost instanceof HTMLElement;
  const skiaHostExists = skiaHost instanceof HTMLElement;

  if (!isLabelExists || !randomShapeButtonExists || !exportPdfButtonExists || !pixiHostExists || !skiaHostExists) {
    throw new Error('Required UI elements are missing from index.html');
  }

  // Creating Pixi application and initial demo scene
  const app = new Application({
    width: PIXI_CONTAINER_WIDTH,
    height: PIXI_CONTAINER_HEIGHT,
    background: DEFAULT_SCENE_BACKGROUND_COLOR,
    forceCanvas: true,
    antialias: true,
  });

  pixiHost.appendChild(app.view as unknown as Node);

  const sceneSync: { run: () => void | Promise<void> } = {
    run: () => {
      app.render();
    },
  };
  const onShapeChange = () => {
    sceneSync.run();
  };

  const pixiContainer = createDemoScene(app.stage, onShapeChange);

  const setStatus = (message: string) => {
    statusLabel.textContent = message;
  };

  // Loading CanvasKit and Creating Skia renderer
  const canvasKit = await loadCanvasKit();
  setStatus('CanvasKit загружен. Рендер через Skia активен.');

  const skiaRenderer = createSkiaRenderer({
    canvasKit,
    width: PIXI_CONTAINER_WIDTH,
    height: PIXI_CONTAINER_HEIGHT,
  });

  skiaHost.appendChild(skiaRenderer.canvasElement);

  // Creating handlers and main functions
  const syncSkiaRender = async (): Promise<void> => {
    app.render();
    await skiaRenderer.render(pixiContainer);
  };
  sceneSync.run = syncSkiaRender;

  const handleRandomShapeClick = async () => {
    addRandomShape(pixiContainer, onShapeChange);

    await syncSkiaRender();

    setStatus('Добавлена случайная фигура. Обновлены оба канваса.');
  };

  const handleExportPdfClick = async () => {
    exportPdfButton.disabled = true;
    setStatus('Генерация PDF…');

    try {
      app.render();

      const pdfBytes = await exportPixiContainerToPdf(canvasKit, pixiContainer, {
        width: PIXI_CONTAINER_WIDTH,
        height: PIXI_CONTAINER_HEIGHT,
      });

      downloadPdf(pdfBytes, DEMO_PDF_FILENAME);
      setStatus('PDF сохранён');
    } catch (error) {
      setStatus(`Ошибка экспорта PDF: ${String(error)}`);
    } finally {
      exportPdfButton.disabled = false;
    }
  };

  // Syncing Skia render
  await syncSkiaRender();

  connectDualCanvasPointers(app, skiaRenderer.canvasElement);

  app.stage.eventMode = 'passive';
  app.stage.interactiveChildren = true;

  randomShapeButton.addEventListener('click', handleRandomShapeClick);
  exportPdfButton.addEventListener('click', handleExportPdfClick);
};

// Application execution and error handling
run().catch((error) => {
  console.error(error);
  const appRoot = document.getElementById(APP_ROOT_ID);

  if (appRoot) {
    appRoot.innerHTML = `<div class="fatal-error">${error.toString()}</div>`;
  }
});
