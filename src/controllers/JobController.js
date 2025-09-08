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
const getOwner_1 = require("../lib/User/getOwner");
class JobController {
    constructor(service) {
        this.service = service;
    }
    getJobsByOwner(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (0, getOwner_1.getOwner)(res);
            if (!owner) {
                res.redirect('/login');
                return;
            }
            const jobs = yield this.service.getJobsByOwner(owner);
            res.send(jobs);
        });
    }
    deleteJobByOwner(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                yield this.service.deleteJobById(id, (0, getOwner_1.getOwner)(res));
                res.status(200).send();
            }
            catch (error) {
                res.status(500).send();
                console.info('Delete job failed');
                console.error(error);
            }
        });
    }
}
exports.default = JobController;
//# sourceMappingURL=JobController.js.map