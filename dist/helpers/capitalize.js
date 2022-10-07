"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalize = void 0;
const capitalize = (s) => {
    if (typeof s !== 'string')
        return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
//# sourceMappingURL=capitalize.js.map