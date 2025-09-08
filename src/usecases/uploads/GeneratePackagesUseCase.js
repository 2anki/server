"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
class GeneratePackagesUseCase {
    execute(paying, files, settings, workspace) {
        return new Promise((resolve, reject) => {
            const data = { paying, files, settings, workspace };
            const workerPath = path_1.default.resolve(__dirname, './worker.js');
            const worker = new worker_threads_1.Worker(workerPath, { workerData: { data } });
            worker.on('message', (result) => resolve(result));
            worker.on('error', (error) => reject(error));
        });
    }
}
exports.default = GeneratePackagesUseCase;
//# sourceMappingURL=GeneratePackagesUseCase.js.map