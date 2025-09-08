"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class StorageHandler {
    constructor() {
        // Set S3 endpoint to DigitalOcean Spaces
        const spacesEndpoint = new aws_sdk_1.default.Endpoint(process.env.SPACES_ENDPOINT);
        this.s3 = new aws_sdk_1.default.S3({
            endpoint: spacesEndpoint,
        });
    }
    uniqify(name, prefix, maxLength, suffix) {
        const now = Date.now().toString();
        let uniqueName = `${prefix}-${now}-${name}`.substring(0, maxLength - (suffix.length + 1));
        if (!uniqueName.endsWith(suffix)) {
            uniqueName += `.${suffix}`;
        }
        return uniqueName;
    }
    static DefaultBucketName() {
        return process.env.SPACES_DEFAULT_BUCKET_NAME;
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const { s3 } = this;
            try {
                yield s3
                    .deleteObject({ Bucket: StorageHandler.DefaultBucketName(), Key: key })
                    .promise();
                return true;
            }
            catch (err) {
                console.info('Delete file failed');
                console.error(err);
                return false;
            }
        });
    }
    getContents(maxKeys = 1000) {
        const { s3 } = this;
        console.debug('getting max', maxKeys, 'keys');
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const files = [];
            try {
                let hasMore = true;
                while (hasMore) {
                    const objects = yield s3
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
            }
            catch (err) {
                if (err) {
                    console.info('Get contents failed');
                    console.error(err);
                    return reject(err);
                }
            }
            console.debug('recieved', files.length, 'keys');
            resolve(files);
        }));
    }
    getFileContents(key) {
        const { s3 } = this;
        return new Promise((resolve, reject) => {
            s3.getObject({ Bucket: StorageHandler.DefaultBucketName(), Key: key }, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    uploadFile(name, data) {
        const { s3 } = this;
        return new Promise((resolve, reject) => {
            s3.putObject({
                Bucket: StorageHandler.DefaultBucketName(),
                Key: name,
                Body: data,
            }, (err, response) => {
                if (err) {
                    console.info('Upload file failed');
                    console.error(err);
                    reject(err);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
}
exports.default = StorageHandler;
//# sourceMappingURL=StorageHandler.js.map