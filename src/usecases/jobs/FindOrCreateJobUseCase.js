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
exports.FindOrCreateJobUseCase = void 0;
const CreateJobUseCase_1 = require("./CreateJobUseCase");
class FindOrCreateJobUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, owner, title, type } = input;
            // Check if the job already exists
            const existingJob = yield this.jobRepository.findJobById(id, owner);
            if (existingJob) {
                return existingJob;
            }
            const createJob = new CreateJobUseCase_1.CreateJobUseCase(this.jobRepository);
            yield createJob.execute({
                id,
                owner,
                title,
                type,
            });
            const secondLookup = yield this.jobRepository.findJobById(id, owner);
            if (!secondLookup) {
                throw new Error('Failed to find or create job after creation attempt');
            }
            return secondLookup;
        });
    }
}
exports.FindOrCreateJobUseCase = FindOrCreateJobUseCase;
//# sourceMappingURL=FindOrCreateJobUseCase.js.map