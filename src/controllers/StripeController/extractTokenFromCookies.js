"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTokenFromCookies = extractTokenFromCookies;
function extractTokenFromCookies(cookies) {
    if (!cookies) {
        return null;
    }
    const cookiesArray = cookies.split('; ');
    const tokenCookie = cookiesArray.find((cookie) => cookie.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
}
//# sourceMappingURL=extractTokenFromCookies.js.map