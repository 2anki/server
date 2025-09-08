"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadHandler = void 0;
const multer_1 = __importDefault(require("multer"));
const getUploadLimits_1 = require("./getUploadLimits");
const getMaxUploadCount_1 = require("./getMaxUploadCount");
const isPaying_1 = require("../isPaying");
const getUploadHandler = (res) => {
    const paying = (0, isPaying_1.isPaying)(res.locals);
    const maxUploadCount = (0, getMaxUploadCount_1.getMaxUploadCount)(paying);
    return (0, multer_1.default)({
        limits: (0, getUploadLimits_1.getUploadLimits)(paying),
        dest: process.env.UPLOAD_BASE,
    }).array('pakker', maxUploadCount);
};
exports.getUploadHandler = getUploadHandler;
//# sourceMappingURL=GetUploadHandler.js.map