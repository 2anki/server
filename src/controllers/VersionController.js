"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VersionController {
    constructor(service) {
        this.service = service;
    }
    getVersionInfo(_req, res) {
        res.status(200).send(this.service.getVersion());
    }
}
exports.default = VersionController;
//# sourceMappingURL=VersionController.js.map