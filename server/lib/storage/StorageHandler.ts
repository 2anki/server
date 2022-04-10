import aws from "aws-sdk";

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
    let _name = `${prefix}-${now}-${name}`.substring(
      0,
      maxLength - (suffix.length + 1)
    );
    if (!_name.endsWith(suffix)) {
      _name += "." + suffix;
    }
    return _name;
  }

  static DefaultBucketName(): string {
    return process.env.SPACES_DEFAULT_BUCKET_NAME!;
  }

  delete(file: aws.S3.Object): Promise<void> {
    /* @ts-ignore */
    return this.deleteWith(file.Key);
  }

  deleteWith(key: string): Promise<void> {
    const s3 = this.s3;
    return new Promise((resolve, reject) => {
      s3.deleteObject(
        { Bucket: StorageHandler.DefaultBucketName(), Key: key },
        function (err, _data) {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  getContents(): Promise<any> {
    const s3 = this.s3;
    return new Promise((resolve, reject) => {
      /* @ts-ignore */
      s3.listObjects(
        { Bucket: StorageHandler.DefaultBucketName() },
        function (err, data) {
          if (err) {
            console.error(err);
            return reject(err);
          } else {
            resolve(data.Contents);
          }
        }
      );
    });
  }

  getFileContents(key: string): Promise<string> {
    const s3 = this.s3;
    return new Promise<string>((resolve, reject) => {
      s3.getObject(
        /* @ts-ignore */
        { Bucket: StorageHandler.DefaultBucketName(), Key: key },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            /* @ts-ignore */
            resolve(data.Body);
          }
        }
      );
    });
  }

  uploadFile(
    name: string,
    data: Buffer | string
  ): Promise<aws.S3.PutObjectOutput> {
    const s3 = this.s3;

    return new Promise<aws.S3.PutObjectOutput>((resolve, reject) => {
      s3.putObject(
        {
          Bucket: StorageHandler.DefaultBucketName(),
          Key: name,
          Body: data,
        },
        (err, response) => {
          if (err) {
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
