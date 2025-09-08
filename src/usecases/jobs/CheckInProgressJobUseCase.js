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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInProgressJobUseCase = void 0;
class CheckInProgressJobUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }
    execute(id, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = yield this.jobRepository.findJobById(id, owner);
            if (!job) {
                throw new Error('Job not found');
            }
            if (job.status === 'started') {
                return true;
            }
            return job.status === 'failed';
        });
    }
}
exports.CheckInProgressJobUseCase = CheckInProgressJobUseCase;
//# sourceMappingURL=CheckInProgressJobUseCase.js.map