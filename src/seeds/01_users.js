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
exports.seed = seed;
const TokenRepository_1 = __importDefault(require("../data_layer/TokenRepository"));
const UsersRepository_1 = __importDefault(require("../data_layer/UsersRepository"));
const AuthenticationService_1 = __importDefault(require("../services/AuthenticationService"));
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Deletes ALL existing entries
        yield knex('users').del();
        const userRepostiory = new UsersRepository_1.default(knex);
        const auth = new AuthenticationService_1.default(new TokenRepository_1.default(knex), userRepostiory);
        // Inserts seed entries
        yield knex('users').insert([
            {
                id: 21,
                name: 'Alexander Alemayhu',
                password: auth.getHashPassword('ichiban'),
                email: 'alexander@alemayhu.com',
            },
        ]);
    });
}
//# sourceMappingURL=01_users.js.map