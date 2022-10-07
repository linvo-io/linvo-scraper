"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLinkedinLink = void 0;
const createLinkedinLink = (getLink, fullLinkedinUrl) => {
    var _a;
    if (!getLink ||
        (getLink.indexOf('/in/') === -1 && getLink.indexOf('/sales/people/') === -1)) {
        return '';
    }
    const link = (_a = getLink === null || getLink === void 0 ? void 0 : getLink.trim()) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, '');
    const newLink = 'https://www.linkedin.com' +
        (link.indexOf('linkedin.com') > -1 ? link.split('linkedin.com')[1] : link);
    const prepend = fullLinkedinUrl ? 'https://www.linkedin.com' : '';
    const path = new URL(newLink).pathname;
    if (path[path.length - 1] === '/') {
        return prepend + path.slice(0, path.length - 1);
    }
    return prepend + path;
};
exports.createLinkedinLink = createLinkedinLink;
//# sourceMappingURL=create.linkedin.url.js.map