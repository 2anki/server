"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractStyles = extractStyles;
/**
 * Extracts the styles from the page and removes formatting issues.
 *
 * Removing list-style-type changes (makes nested toggles work)
 * Removing white-space: pre-wrap (don't remember why)
 *
 * @param page
 */
function extractStyles(page) {
    let style = page('style').html();
    if (!style) {
        return null;
    }
    return style
        .replace(/white-space: pre-wrap;/g, '')
        .replace(/list-style-type: none;/g, '');
}
//# sourceMappingURL=extractStyles.js.map