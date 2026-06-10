import type { Container } from 'pixi.js-legacy';
import type { CanvasKit } from '@rollerbird/canvaskit-wasm-pdf';
import { convertPixiContainerToSkia } from '../PixiToSkiaConverter';
import { DEMO_PDF_AUTHOR, DEMO_PDF_TITLE } from '../../shared/constants';
import { PDF_CREATOR, PDF_PRODUCER } from './constants';
import type { PdfExportOptions } from './types';

export const exportPixiContainerToPdf = async (
  canvasKit: CanvasKit,
  container: Container,
  options: PdfExportOptions,
): Promise<Uint8Array> => {
  const { width, height } = options;

  const pdfDocument = canvasKit.MakePDFDocument({
    title: DEMO_PDF_TITLE,
    author: DEMO_PDF_AUTHOR,
    creator: PDF_CREATOR,
    producer: PDF_PRODUCER,
  });

  const pageCanvas = pdfDocument.beginPage(width, height);
  await convertPixiContainerToSkia(canvasKit, pageCanvas, container);

  pdfDocument.endPage();
  const pdfBytes = pdfDocument.close();
  pdfDocument.delete();

  return pdfBytes;
};
