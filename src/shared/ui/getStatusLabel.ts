import { STATUS_LABEL_ID } from '@/shared/constants';

export const getStatusLabel = () => {
  const label = document.getElementById(STATUS_LABEL_ID);

  return label;
};
