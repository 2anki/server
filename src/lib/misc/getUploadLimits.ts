export const MAX_FIELD_SIZE = 2 * 1024 * 1024;
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

export const MAX_FIELD_SIZE_PATRON = MAX_FIELD_SIZE * 10;
export const MAX_UPLOAD_SIZE_PATRON = MAX_UPLOAD_SIZE * 100;

export const getUploadLimits = () => {
  return {
    fileSize: MAX_UPLOAD_SIZE_PATRON,
    fieldSize: MAX_FIELD_SIZE_PATRON,
  };
};
