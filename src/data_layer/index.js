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
exports.setupDatabase = exports.getDatabase = void 0;
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
const knex_1 = __importDefault(require("knex"));
const ScheduleCleanup_1 = require("../lib/storage/jobs/ScheduleCleanup");
const KnexConfig_1 = __importDefault(require("../KnexConfig"));
/**
 * Performing this assignment here to prevent new connections from being created.
 */
const SINGLE_CONNECTION = (0, knex_1.default)({
    client: 'pg',
    connection: process_1.default.env.DATABASE_URL,
});
const getDatabase = () => SINGLE_CONNECTION;
exports.getDatabase = getDatabase;
const setupDatabase = (database) => __awaiter(void 0, void 0, void 0, function* () {
    if (!process_1.default.env.DATABASE_URL) {
        console.info('DATABASE_URL is not set, skipping DB setup.');
        console.warn("Things might not work as expected. If you're running this locally, you can ignore this warning if you are only interested in HTML uploads.");
        return;
    }
    try {
        yield database.raw('SELECT 1');
        if (process_1.default.env.MIGRATIONS_DIR) {
            process_1.default.chdir(path_1.default.join(process_1.default.env.MIGRATIONS_DIR, '..'));
        }
        if (process_1.default.env.NODE_ENV === 'production') {
            console.info('DB is ready');
            (0, ScheduleCleanup_1.ScheduleCleanup)(database);
        }
        yield database.migrate.latest(KnexConfig_1.default);
        // Completed jobs become uploads. Any left during startup means they failed.
        yield database.raw("UPDATE jobs SET status = 'failed';");
    }
    catch (error) {
        console.error(error);
        process_1.default.exit(1);
    }
});
exports.setupDatabase = setupDatabase;
//# sourceMappingURL=index.js.map