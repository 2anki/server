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
class JobService {
    constructor(repository) {
        this.repository = repository;
    }
    getJobsByOwner(owner) {
        return this.repository.getJobsByOwner(owner);
    }
    deleteJobById(id, owner) {
        return this.repository.deleteJob(id, owner);
    }
    getAllStartedJobs(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobs = yield this.repository.getJobsByOwner(owner);
            return jobs.filter((job) => job.status === 'started');
        });
    }
}
exports.default = JobService;
//# sourceMappingURL=JobService.js.map