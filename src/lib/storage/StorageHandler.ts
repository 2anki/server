import aws from 'aws-sdk';
import { ObjectList } from 'aws-sdk/clients/s3';

class StorageHandler {
  s3: aws.S3;

  constructor() {
    // Set S3 endpoint to DigitalOcean Spaces
    const spacesEndpoint = new aws.Endpoint(process.env.SPACES_ENDPOINT!);
    this.s3 = new aws.S3({
      endpoint: spacesEndpoint,
    });
  }

  uniqify(
    name: string,
    prefix: string,
    maxLength: number,
    suffix: string
  ): string {
    const now = Date.now().toString();
    let uniqueName = `${prefix}-${now}-${name}`.substring(
      0,
      maxLength - (suffix.length + 1)
    );
    if (!uniqueName.endsWith(suffix)) {
      uniqueName += `.${suffix}`;
    }
    return uniqueName;
  }

  static DefaultBucketName(): string {
    return process.env.SPACES_DEFAULT_BUCKET_NAME!;
  }

  async delete(key: string): Promise<boolean> {
    const { s3 } = this;
    try {
      await s3
        .deleteObject({ Bucket: StorageHandler.DefaultBucketName(), Key: key })
        .promise();
      return true;
    } catch (err) {
      console.info('Delete file failed');
      console.error(err);
      return false;
    }
  }

  getContents(maxKeys: number = 1000): Promise<ObjectList | undefined> {
    const { s3 } = this;
    console.debug('getting max', maxKeys, 'keys');
    return new Promise(async (resolve, reject) => {
      const files = [];
      try {
        let hasMore = true;
        while (hasMore) {
          const objects = await s3
            .listObjects({
              Bucket: StorageHandler.DefaultBucketName(),
              MaxKeys: maxKeys,
            })
            .promise();
          if (objects.Contents) {
            files.push(...objects.Contents);
          }
          hasMore = files.length < maxKeys && Boolean(objects.IsTruncated);
        }
      } catch (err) {
        if (err) {
          console.info('Get contents failed');
          console.error(err);
          return reject(err);
        }
      }
      console.debug('recieved', files.length, 'keys');
      resolve(files);
    });
  }

  getFileContents(key: string): Promise<aws.S3.GetObjectOutput> {
    const { s3 } = this;
    return new Promise<aws.S3.GetObjectOutput>((resolve, reject) => {
      s3.getObject(
        { Bucket: StorageHandler.DefaultBucketName(), Key: key },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });
  }

  uploadFile(
    name: string,
    data: Buffer | string
  ): Promise<aws.S3.PutObjectOutput> {
    const { s3 } = this;

    return new Promise<aws.S3.PutObjectOutput>((resolve, reject) => {
      s3.putObject(
        {
          Bucket: StorageHandler.DefaultBucketName(),
          Key: name,
          Body: data,
        },
        (err, response) => {
          if (err) {
            console.info('Upload file failed');
            console.error(err);
            reject(err);
          } else {
            resolve(response);
          }
        }
      );
    });
  }
}

export default StorageHandler;
