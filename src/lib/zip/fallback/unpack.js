"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpack = unpack;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const listFiles_1 = require("./listFiles");
const TAR_PATH = '/usr/bin/bsdtar';
function unpack(filePath, workspace) {
    return new Promise((resolve, reject) => {
        const stdoutLogPath = (0, node_path_1.join)(workspace, 'tar_stdout.log');
        const stderrLogPath = (0, node_path_1.join)(workspace, 'tar_stderr.log');
        const stdoutStream = (0, node_fs_1.createWriteStream)(stdoutLogPath, { flags: 'a' });
        const stderrStream = (0, node_fs_1.createWriteStream)(stderrLogPath, { flags: 'a' });
        const decompressProcess = (0, node_child_process_1.spawn)(TAR_PATH, ['xvf', filePath], {
            cwd: workspace,
        });
        decompressProcess.stdout.pipe(stdoutStream);
        decompressProcess.stderr.pipe(stderrStream);
        decompressProcess.on('close', () => {
            // We are not reading the status code because we support partial extraction
            (0, listFiles_1.listFiles)(workspace).then(resolve).catch(reject);
        });
    });
}
//# sourceMappingURL=unpack.js.map