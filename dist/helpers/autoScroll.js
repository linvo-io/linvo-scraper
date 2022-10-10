"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoScroll = void 0;
async function autoScroll(page) {
    await page.evaluate(() => new Promise((resolve) => {
        var scrollTop = -1;
        const interval = setInterval(() => {
            window.scrollBy(0, 100);
            if (document.documentElement.scrollTop !== scrollTop) {
                scrollTop = document.documentElement.scrollTop;
                return false;
            }
            clearInterval(interval);
            resolve(void {});
        }, 150);
    }));
}
exports.autoScroll = autoScroll;
//# sourceMappingURL=autoScroll.js.map