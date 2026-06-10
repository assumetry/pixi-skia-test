import { DEMO_PDF_FILENAME } from '../../shared/constants';
import { PDF_MIME_TYPE } from './constants';

export const downloadPdf = (
  pdfBytes: Uint8Array,
  filename = DEMO_PDF_FILENAME,
) => {
  const blob = new Blob([pdfBytes as BlobPart], { type: PDF_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
