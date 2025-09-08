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
exports.CreateJobWorkSpaceUseCase = void 0;
const CustomExporter_1 = __importDefault(require("../../lib/parser/exporters/CustomExporter"));
const loadSettingsFromDatabase_1 = require("../../lib/parser/Settings/loadSettingsFromDatabase");
const data_layer_1 = require("../../data_layer");
const BlockHandler_1 = __importDefault(require("../../services/NotionService/BlockHandler/BlockHandler"));
const ParserRules_1 = __importDefault(require("../../lib/parser/ParserRules"));
const WorkSpace_1 = __importDefault(require("../../lib/parser/WorkSpace"));
class CreateJobWorkSpaceUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateStatusResult = yield this.jobRepository.updateJobStatus(input.id, input.owner, 'step1_create_workspace', '');
            if (!updateStatusResult) {
                throw new Error('Failed to update job status');
            }
            const { id, owner, api } = input;
            const ws = new WorkSpace_1.default(true, 'fs');
            console.debug(`using workspace ${ws.location}`);
            const exporter = new CustomExporter_1.default('', ws.location);
            // TODO: refactor loadSettingsFromDatabase out
            const settings = yield (0, loadSettingsFromDatabase_1.loadSettingsFromDatabase)((0, data_layer_1.getDatabase)(), owner, id);
            console.debug(`using settings ${JSON.stringify(settings, null, 2)}`);
            const bl = new BlockHandler_1.default(exporter, api, settings);
            // TODO: refactor ParserRules.load out
            const rules = yield ParserRules_1.default.Load(owner, id);
            bl.useAll = rules.UNLIMITED;
            return { ws, exporter, settings, bl, rules };
        });
    }
}
exports.CreateJobWorkSpaceUseCase = CreateJobWorkSpaceUseCase;
//# sourceMappingURL=CreateJobWorkSpaceUseCase.js.map