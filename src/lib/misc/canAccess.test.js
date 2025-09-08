"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canAccess_1 = require("./canAccess");
test('returns false on path traversal', () => {
    // Arrange
    const directoryPath = '/tmp/..';
    // Act
    const access = (0, canAccess_1.canAccess)(directoryPath);
    // Assert
    expect(access).toBe(false);
});
test('returns true for workspace path', () => {
    // Arrange
    const directoryPath = '/tmp/download/03d993ad-7b85-44bc-a810-aa3098a1b483';
    // Act
    const access = (0, canAccess_1.canAccess)(directoryPath, '/tmp');
    // Assert
    expect(access).toBe(true);
});
test('returns false for relative path', () => {
    // Arrange
    const directoryPath = '~/.config';
    // Act
    const access = (0, canAccess_1.canAccess)(directoryPath);
    // Assert
    expect(access).toBe(false);
});
test('returns false if outside of basePath', () => {
    // Arrange
    const directoryPath = '/home/user/Downloads';
    // Act
    const access = (0, canAccess_1.canAccess)(directoryPath, '/tmp/workspace');
    // Assert
    expect(access).toBe(false);
});
test('returns true for APKG in workspace', () => {
    // Arrange
    const directoryPath = '/tmp/download/03d993ad-7b85-44bc-a810-aa3098a1b483/x.apkg';
    // Act
    const access = (0, canAccess_1.canAccess)(directoryPath, '/tmp');
    // Assert
    expect(access).toBe(true);
});
test('returns false for newlines ', () => {
    // Arrange
    const newLines = 'This is a long string' +
        ' that spans multiple lines.' +
        '\nIt can contain newlines' +
        ' and other characters without any issues.';
    // Act
    const access = (0, canAccess_1.canAccess)(newLines);
    // Assert
    expect(access).toBe(false);
});
test('returns false for long filename', () => {
    // Arrange
    const longString = 'A musical instrument is a device created or adapted to make musical sounds. In principle, any object that produces sound can be considered a musical instrument—it is through purpose that the object becomes a musical instrument. A person who plays a musical instrument is known as an instrumentalist. The history of musical instruments dates to the beginnings of human culture. Early musical instruments may have been used for rituals, such as a horn to signal success on the hunt, or a drum in a religious ceremony. Cultures eventually developed composition and performance of melodies for entertainment. Musical instruments evolved in step with changing applications and technologies.';
    // Act
    const access = (0, canAccess_1.canAccess)(longString);
    // Assert
    expect(access).toBe(false);
});
//# sourceMappingURL=canAccess.test.js.map