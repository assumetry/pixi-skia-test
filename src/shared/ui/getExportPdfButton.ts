import { EXPORT_PDF_BUTTON_ID } from '@/shared/constants';

export const getExportPdfButton = () => {
  const button = document.getElementById(EXPORT_PDF_BUTTON_ID);

  return button;
};
