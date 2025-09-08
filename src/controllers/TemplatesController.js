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
class TemplatesController {
    constructor(service) {
        this.service = service;
    }
    createTemplate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`/templates/create`);
            const { templates } = req.body;
            const owner = (0, getOwner_1.getOwner)(res);
            try {
                yield this.service.create(owner, templates);
                res.status(200).send();
            }
            catch (error) {
                console.error(error);
                res.status(400).send();
            }
        });
    }
    deleteTemplate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (0, getOwner_1.getOwner)(res);
            try {
                yield this.service.delete(owner);
                res.status(200).send();
            }
            catch (error) {
                console.error(error);
                res.status(400).send();
            }
        });
    }
}
exports.default = TemplatesController;
//# sourceMappingURL=TemplatesController.js.map