export const FREE_USER_MAX_FIELD_SIZE = 2 * 1024 * 1024;
export const FREE_USER_MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

export const SUBSCRIBER_MAX_FIELD_SIZE = FREE_USER_MAX_FIELD_SIZE * 10;
export const SUBSCRIBER_MAX_UPLOAD_SIZE = FREE_USER_MAX_UPLOAD_SIZE * 100;

export const getUploadLimits = (isPatron: boolean) =>
  isPatron
    ? {
        fileSize: SUBSCRIBER_MAX_UPLOAD_SIZE,
        fieldSize: SUBSCRIBER_MAX_FIELD_SIZE,
      }
    : {
        fileSize: FREE_USER_MAX_UPLOAD_SIZE,
        fieldSize: FREE_USER_MAX_FIELD_SIZE,
      };
