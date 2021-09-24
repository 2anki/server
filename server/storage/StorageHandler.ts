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
}

export default StorageHandler;
