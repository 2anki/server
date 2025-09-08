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
exports.default = performConversion;
const StorageHandler_1 = __importDefault(require("../../StorageHandler"));
const isPaying_1 = require("../../../isPaying");
const JobRepository_1 = __importDefault(require("../../../../data_layer/JobRepository"));
const FindOrCreateJobUseCase_1 = require("../../../../usecases/jobs/FindOrCreateJobUseCase");
const CheckInProgressJobUseCase_1 = require("../../../../usecases/jobs/CheckInProgressJobUseCase");
const CheckJobLimitUseCase_1 = require("../../../../usecases/jobs/CheckJobLimitUseCase");
const CancelJobUseCase_1 = require("../../../../usecases/jobs/CancelJobUseCase");
const StartJobUseCase_1 = require("../../../../usecases/jobs/StartJobUseCase");
const CreateJobWorkSpaceUseCase_1 = require("../../../../usecases/jobs/CreateJobWorkSpaceUseCase");
const CreateFlashcardsForJobUseCase_1 = require("../../../../usecases/jobs/CreateFlashcardsForJobUseCase");
const SetJobFailedUseCase_1 = require("../../../../usecases/jobs/SetJobFailedUseCase");
const BuildDeckForJobUseCase_1 = require("../../../../usecases/jobs/BuildDeckForJobUseCase");
const CompleteJobUseCase_1 = require("../../../../usecases/jobs/CompleteJobUseCase");
const NotifyUserUseCase_1 = require("../../../../usecases/jobs/NotifyUserUseCase");
function performConversion(database_1, _a) {
    return __awaiter(this, arguments, void 0, function* (database, { title, api, id, owner, res, type }) {
        console.log(`Performing conversion for ${id}`);
        // We need to keep track of whether the user is waiting for a response
        let waitingResponse = true;
        const storage = new StorageHandler_1.default();
        const jobRepository = new JobRepository_1.default(database);
        const findOrCreateJobUseCase = new FindOrCreateJobUseCase_1.FindOrCreateJobUseCase(jobRepository);
        const job = yield findOrCreateJobUseCase.execute({
            id,
            owner,
            title,
            type: type || 'conversion',
        });
        try {
            const checkInProgress = new CheckInProgressJobUseCase_1.CheckInProgressJobUseCase(jobRepository);
            const hasInProgressJob = yield checkInProgress.execute(id, owner);
            if (!hasInProgressJob) {
                console.log(`job ${id} was not started. Job is already active.`);
                return res ? res.redirect('/uploads') : null;
            }
            const checkLimit = new CheckJobLimitUseCase_1.CheckJobLimitUseCase(jobRepository);
            // Max jobs allowed for free users
            const maxJobs = !(0, isPaying_1.isPaying)(res === null || res === void 0 ? void 0 : res.locals) ? 1 : Infinity;
            const canCreateJob = yield checkLimit.execute({ owner, maxJobs });
            if (!canCreateJob) {
                const cancelJob = new CancelJobUseCase_1.CancelJobUseCase(jobRepository);
                yield cancelJob.execute({
                    id,
                    owner,
                    reason: 'You have reached the limit of free jobs. Max 1 at a time.',
                });
                return res ? res.redirect('/uploads') : null;
            }
            console.log(`job ${id} is not active, starting`);
            const startJob = new StartJobUseCase_1.StartJobUseCase(jobRepository);
            yield startJob.execute({ id, owner });
            /**
             * We do not know how long the job takes to complete, so we need to
             * give the user a response immediately.
             */
            if (res) {
                waitingResponse = false;
                res.status(200).send();
            }
            const createWorkSpace = new CreateJobWorkSpaceUseCase_1.CreateJobWorkSpaceUseCase(jobRepository);
            const { ws, exporter, settings, bl, rules } = yield createWorkSpace.execute({ api, id, owner, jobRepository });
            const createFlashcards = new CreateFlashcardsForJobUseCase_1.CreateFlashcardsForJobUseCase(jobRepository);
            const decks = yield createFlashcards.execute({
                bl,
                id,
                owner,
                rules,
                settings,
                type,
            });
            if (!decks || decks.length === 0) {
                const setJobFailed = new SetJobFailedUseCase_1.SetJobFailedUseCase(jobRepository);
                yield setJobFailed.execute(id, owner, 'No decks created, please try again or contact support with' +
                    id +
                    '.' +
                    job.id);
                return;
            }
            const buildDeck = new BuildDeckForJobUseCase_1.BuildDeckForJobUseCase(jobRepository);
            const { size, key, apkg } = yield buildDeck.execute({
                bl,
                exporter,
                decks,
                ws,
                settings,
                storage,
                id,
                owner,
            });
            const notifyUser = new NotifyUserUseCase_1.NotifyUserUseCase(jobRepository);
            yield notifyUser.execute({
                owner,
                rules,
                db: database,
                size,
                key,
                id,
                apkg,
            });
            const completeJob = new CompleteJobUseCase_1.CompleteJobUseCase(jobRepository);
            yield completeJob.execute(id, owner);
        }
        catch (error) {
            const failedJob = new SetJobFailedUseCase_1.SetJobFailedUseCase(jobRepository);
            yield failedJob.execute(id, owner, 'Technical error ' + error);
            // The User is still waiting and has not received a response yet
            if (waitingResponse) {
                res === null || res === void 0 ? void 0 : res.status(400).send('conversion failed.');
            }
            console.error(error);
        }
    });
}
//# sourceMappingURL=performConversion.js.map