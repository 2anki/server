const FREE_USER_MAX_FIELD_SIZE = 2 * 1024 * 1024;
const FREE_USER_MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

const PATREON_MAX_FIELD_SIZE = FREE_USER_MAX_FIELD_SIZE * 10;
const PATREON_MAX_UPLOAD_SIZE = FREE_USER_MAX_UPLOAD_SIZE * 100;

const SUBSCRIBER_MAX_FIELD_SIZE = FREE_USER_MAX_FIELD_SIZE * 5;
const SUBSCRIBER_MAX_UPLOAD_SIZE = FREE_USER_MAX_UPLOAD_SIZE * 5;

export interface UploaderInfo {
  patron: boolean;
  subscriber: boolean;
}

export const getUploadLimits = ({ patron, subscriber }: UploaderInfo) => {
  if (patron) {
    return {
      fileSize: PATREON_MAX_UPLOAD_SIZE,
      fieldSize: PATREON_MAX_FIELD_SIZE,
    };
  }

  if (subscriber) {
    return {
      fileSize: SUBSCRIBER_MAX_UPLOAD_SIZE,
      fieldSize: SUBSCRIBER_MAX_FIELD_SIZE,
    };
  }

  return {
    fileSize: FREE_USER_MAX_UPLOAD_SIZE,
    fieldSize: FREE_USER_MAX_FIELD_SIZE,
  };
};
