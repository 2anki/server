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
class SettingsService {
    constructor(repository) {
        this.repository = repository;
    }
    create({ owner, payload, object_id }) {
        return new Promise((resolve, reject) => {
            return this.repository
                .create({
                owner,
                payload,
                object_id,
            })
                .then((settings) => {
                resolve(settings);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    delete(owner, id) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.repository.delete(owner, id);
                resolve();
            }
            catch (error) {
                reject(error);
            }
        }));
    }
    getById(id) {
        return this.repository.getById(id);
    }
}
exports.default = SettingsService;
//# sourceMappingURL=SettingsService.js.map