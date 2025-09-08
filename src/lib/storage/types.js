"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFileNameEqual = isFileNameEqual;
/**
 * Check if the file name is equal to the name
 * This can be used to find the contents of a file in the payload.
 * Due to encoding issues, we need to check both the encoded and decoded names
 *
 * @param file uploaded file from user
 * @param name name of the file
 * @returns true if the file name is equal to the name
 */
function isFileNameEqual(file, name) {
    try {
        // For backwards compatibility, we need to support the old way of parsing
        const decodedName = global.decodeURIComponent(name);
        if (file.name === decodedName) {
            return true;
        }
    }
    catch (error) {
        console.error(error);
        console.debug('Failed to decode name');
    }
    try {
        const decodedFilename = global.decodeURIComponent(file.name);
        const decodedName = global.decodeURIComponent(name);
        return decodedFilename === decodedName;
    }
    catch (error) {
        console.error(error);
        console.debug('Failed to decode names');
    }
    return file.name === name;
}
//# sourceMappingURL=types.js.map