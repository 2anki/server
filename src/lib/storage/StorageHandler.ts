import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  _Object,
} from '@aws-sdk/client-s3';

function resolveSpacesEndpoint(): string | undefined {
  const raw = process.env.SPACES_ENDPOINT?.trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

class StorageHandler {
  s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: resolveSpacesEndpoint(),
      region: process.env.SPACES_REGION ?? 'us-east-1',
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
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: StorageHandler.DefaultBucketName(),
          Key: key,
        })
      );
      return true;
    } catch (err) {
      console.info('Delete file failed');
      console.error(err);
      return false;
    }
  }

  async getContents(maxKeys: number = 1000): Promise<_Object[] | undefined> {
    console.debug('getting max', maxKeys, 'keys');
    const files: _Object[] = [];
    try {
      let hasMore = true;
      while (hasMore) {
        const objects = await this.s3.send(
          new ListObjectsCommand({
            Bucket: StorageHandler.DefaultBucketName(),
            MaxKeys: maxKeys,
          })
        );
        if (objects.Contents) {
          files.push(...objects.Contents);
        }
        hasMore = files.length < maxKeys && Boolean(objects.IsTruncated);
      }
    } catch (err) {
      console.info('Get contents failed');
      console.error(err);
      throw err;
    }
    console.debug('recieved', files.length, 'keys');
    return files;
  }

  async getFileContents(key: string): Promise<{ Body: Buffer }> {
    const response = await this.s3.send(
      new GetObjectCommand({
        Bucket: StorageHandler.DefaultBucketName(),
        Key: key,
      })
    );
    if (!response.Body) {
      return { Body: Buffer.alloc(0) };
    }
    const bytes = await response.Body.transformToByteArray();
    return { Body: Buffer.from(bytes) };
  }

  async uploadFile(
    name: string,
    data: Buffer | string
  ): Promise<PutObjectCommandOutput> {
    try {
      return await this.s3.send(
        new PutObjectCommand({
          Bucket: StorageHandler.DefaultBucketName(),
          Key: name,
          Body: data,
        })
      );
    } catch (err) {
      console.info('Upload file failed');
      console.error(err);
      throw err;
    }
  }
}

export default StorageHandler;
