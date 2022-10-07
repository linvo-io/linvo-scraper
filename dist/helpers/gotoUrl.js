"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gotoUrl = void 0;
const gotoUrl = async (page, url) => {
    try {
        await page.goto(url, {
            timeout: 0
        });
    }
    catch (err) { }
};
exports.gotoUrl = gotoUrl;
//# sourceMappingURL=gotoUrl.js.map