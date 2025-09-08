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
class JobRepository {
    constructor(database) {
        this.database = database;
        this.tableName = 'jobs';
    }
    getJobsByOwner(owner) {
        return this.database(this.tableName).where({ owner }).returning(['*']);
    }
    deleteJob(id, owner) {
        return this.database(this.tableName).delete().where({
            object_id: id,
            owner: owner,
        });
    }
    create(id, owner, title, type) {
        return this.database(this.tableName).insert({
            type,
            title,
            object_id: id,
            owner,
            status: 'started',
            last_edited_time: new Date(),
        });
    }
    findJobById(id, owner) {
        return this.database(this.tableName)
            .where({ object_id: id, owner })
            .returning('*')
            .first();
    }
    updateJobStatus(id, owner, status, description) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.database(this.tableName)
                .where({ object_id: id, owner })
                .update({
                status,
                job_reason_failure: description,
                last_edited_time: new Date(),
            })
                .returning('*');
            return rows[0];
        });
    }
}
exports.default = JobRepository;
//# sourceMappingURL=JobRepository.js.map