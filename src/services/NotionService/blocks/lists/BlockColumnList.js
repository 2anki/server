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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlockColumnList;
const getChildren_1 = __importDefault(require("../../helpers/getChildren"));
const getColumn_1 = __importDefault(require("../../helpers/getColumn"));
const BlockColumn_1 = __importDefault(require("./BlockColumn"));
function BlockColumnList(block, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        const firstColumn = yield (0, getColumn_1.default)(block.id, handler, 0);
        if (firstColumn) {
            return (0, BlockColumn_1.default)(firstColumn, handler);
        }
        return (0, getChildren_1.default)(block, handler);
    });
}
//# sourceMappingURL=BlockColumnList.js.map