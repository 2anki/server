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
class RulesController {
    constructor(service) {
        this.service = service;
    }
    createRule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            try {
                const result = yield this.service.createRule(id, (0, getOwner_1.getOwner)(res), req.body.payload);
                res.status(200).send(result);
            }
            catch (error) {
                console.info('Create rule failed');
                console.error(error);
                res.status(400).send();
            }
        });
    }
    findRule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            try {
                const rule = yield this.service.getById(id);
                res.status(200).json(rule);
            }
            catch (err) {
                console.info('Get rule failed');
                console.error(err);
                res.status(200).json();
            }
        });
    }
}
exports.default = RulesController;
//# sourceMappingURL=ParserRulesController.js.map