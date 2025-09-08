"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const JobController_1 = __importDefault(require("./JobController"));
const getOwnerModule = __importStar(require("../lib/User/getOwner"));
describe('JobController', () => {
    let jobService;
    let jobController;
    let req;
    let res;
    beforeEach(() => {
        jobService = {
            getJobsByOwner: jest.fn(),
            deleteJobById: jest.fn(),
        };
        jobController = new JobController_1.default(jobService);
        req = { params: { id: '123' } };
        res = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
            redirect: jest.fn(),
        };
        jest.spyOn(getOwnerModule, 'getOwner').mockReturnValue('owner1');
    });
    it('should get jobs by owner and send them', () => __awaiter(void 0, void 0, void 0, function* () {
        jobService.getJobsByOwner.mockResolvedValue([
            'job1',
            'job2',
        ]);
        yield jobController.getJobsByOwner(req, res);
        expect(jobService.getJobsByOwner).toHaveBeenCalled();
        expect(res.send).toHaveBeenCalledWith(['job1', 'job2']);
    }));
    it('should delete job by owner and send 200', () => __awaiter(void 0, void 0, void 0, function* () {
        jobService.deleteJobById.mockResolvedValue(undefined);
        yield jobController.deleteJobByOwner(req, res);
        expect(jobService.deleteJobById).toHaveBeenCalledWith('123', 'owner1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
    }));
    it('should handle error in deleteJobByOwner', () => __awaiter(void 0, void 0, void 0, function* () {
        jobService.deleteJobById.mockRejectedValue(new Error('fail'));
        yield jobController.deleteJobByOwner(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalled();
    }));
    it('should redirect to login if owner is missing when getting jobs', () => __awaiter(void 0, void 0, void 0, function* () {
        getOwnerModule.getOwner.mockReturnValue(undefined);
        yield jobController.getJobsByOwner(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/login');
        expect(res.send).not.toHaveBeenCalled();
    }));
});
//# sourceMappingURL=JobController.test.js.map