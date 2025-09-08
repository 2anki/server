"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NotionService_1 = __importDefault(require("../../services/NotionService"));
const UploadService_1 = __importDefault(require("../../services/UploadService"));
const UploadController_1 = __importDefault(require("./UploadController"));
describe('Upload file', () => {
    test('upload failed is caught', () => {
        // Arrange
        const repository = {
            deleteUpload: function (owner, _key) {
                return Promise.resolve(1);
            },
            getUploadsByOwner: function (owner) {
                return Promise.resolve([]);
            },
            update: function (owner, filename, key, size_mb) {
                return Promise.resolve([]);
            },
        };
        const notionRepository = {
            getNotionData: function (owner) {
                return Promise.resolve({ owner: 1, token: '...' });
            },
            saveNotionToken: function (user, data, hash) {
                return Promise.resolve(true);
            },
            getNotionToken: function (owner) {
                return Promise.resolve('...');
            },
            deleteBlocksByOwner: function (owner) {
                return Promise.resolve(owner);
            },
            deleteNotionData(owner) {
                return Promise.resolve(true);
            },
        };
        const uploadService = new UploadService_1.default(repository);
        const notionService = new NotionService_1.default(notionRepository);
        const uploadController = new UploadController_1.default(uploadService, notionService);
        // Act
        const setHTTPStatusCode = (code) => expect(code).toBe(400);
        // Assert
        uploadController.file({}, {
            status: (code) => setHTTPStatusCode(code),
        });
    });
});
//# sourceMappingURL=UploadController.test.js.map