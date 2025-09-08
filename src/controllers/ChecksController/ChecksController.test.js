"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChecksController_1 = require("./ChecksController");
describe('ChecksController', () => {
    describe('getStatusCheck', () => {
        it('should return a 200 status code', () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            const checksController = new ChecksController_1.ChecksController();
            checksController.getStatusCheck(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('2anki.net');
        });
    });
});
//# sourceMappingURL=ChecksController.test.js.map