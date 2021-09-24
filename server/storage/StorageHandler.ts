import aws from "aws-sdk";

class StorageHandler {
  s3: aws.S3;

  constructor() {
    // Set S3 endpoint to DigitalOcean Spaces
    const spacesEndpoint = new aws.Endpoint("fra1.digitaloceanspaces.com");
    this.s3 = new aws.S3({
      endpoint: spacesEndpoint,
    });
  }

  delete(file: aws.S3.Object): Promise<void> {
    let s3 = this.s3;
    return new Promise((resolve, reject) => {
      s3.deleteObject(
        /* @ts-ignore */
        { Bucket: "spaces.2anki.net", Key: file.Key },
        function (err, data) {
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
    let s3 = this.s3;
    return new Promise((resolve, reject) => {
      /* @ts-ignore */
      s3.listObjects({ Bucket: "spaces.2anki.net" }, function (err, data) {
        if (err) {
          console.error(err);
          return reject(err);
        } else {
          resolve(data.Contents);
        }
      });
    });
  }
}

export default StorageHandler;
