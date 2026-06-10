import { STATUS_LABEL_ID } from '../constants';

export const getStatusLabel = () => {
  const label = document.getElementById(STATUS_LABEL_ID);

  return label;
};
