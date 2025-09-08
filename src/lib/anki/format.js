"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidAudioFile = exports.addDeckNameSuffix = exports.isValidDeckName = exports.AUDIO_FILE_SUFFIX = exports.DECK_NAME_SUFFIX = void 0;
exports.DECK_NAME_SUFFIX = 'apkg';
exports.AUDIO_FILE_SUFFIX = 'mp3';
const isValidDeckName = (filename) => filename.endsWith(`.${exports.DECK_NAME_SUFFIX}`);
exports.isValidDeckName = isValidDeckName;
const addDeckNameSuffix = (filename) => `${filename}.${exports.DECK_NAME_SUFFIX}`;
exports.addDeckNameSuffix = addDeckNameSuffix;
const isValidAudioFile = (filename) => filename.endsWith(`.${exports.AUDIO_FILE_SUFFIX}`);
exports.isValidAudioFile = isValidAudioFile;
//# sourceMappingURL=format.js.map