import multer from 'multer';
import multerS3 from 'multer-s3';

import { MAX_FIELD_SIZE, MAX_UPLOAD_SIZE } from '../../lib/misc/file';
import StorageHandler from '../../lib/storage/StorageHandler';

export default function upload(storage: StorageHandler) {
  return multer({
    limits: { fileSize: MAX_UPLOAD_SIZE, fieldSize: MAX_FIELD_SIZE },
    storage: multerS3({
      s3: storage.s3,
      bucket: StorageHandler.DefaultBucketName(),
      key(_request, file, cb) {
        let suffix = '.zip';
        if (
          file.originalname.includes('.')
          && file.originalname.split('.').length > 1
        ) {
          const parts = file.originalname.split('.');
          suffix = parts[parts.length - 1];
        }
        cb(null, storage.uniqify(file.originalname, 'upload', 256, suffix));
      },
    }),
  }).array('pakker', 21);
}
