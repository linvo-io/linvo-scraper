"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinLikeService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const create_linkedin_url_1 = require("../helpers/create.linkedin.url");
const gotoUrl_1 = require("../helpers/gotoUrl");
const timer_1 = require("../helpers/timer");
class LinkedinLikeService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async process(page, cdp, data) {
        const { url } = data;
        const theUrl = (0, create_linkedin_url_1.createLinkedinLink)(url, true);
        (0, gotoUrl_1.gotoUrl)(page, theUrl);
        await this.waitForLoader(page);
        await (0, timer_1.timer)(8000);
        const onlyUrl = await page.evaluate(() => {
            return window.location.href;
        });
        await page.goto("about:blank");
        const newUrl = (0, create_linkedin_url_1.createLinkedinLink)(onlyUrl, false);
        (0, gotoUrl_1.gotoUrl)(page, onlyUrl + "/detail/recent-activity/shares/");
        try {
            await this.waitForLoader(page);
            await page.waitForSelector(".social-actions-button", {
                visible: true,
                timeout: 7000,
            });
            const all = await page.evaluate(() => {
                var _a, _b, _c;
                return (_c = (_b = (_a = Array.from(document.querySelectorAll("[data-urn]"))) === null || _a === void 0 ? void 0 : _a.reduce((all, current) => {
                    var _a;
                    return [
                        ...all,
                        (_a = current === null || current === void 0 ? void 0 : current.querySelector(".social-actions-button")) === null || _a === void 0 ? void 0 : _a.getAttribute("id"),
                    ];
                }, [])) === null || _b === void 0 ? void 0 : _b.filter((f) => f)) === null || _c === void 0 ? void 0 : _c.slice(0, 1);
            }, []);
            if (!all.length) {
                return { linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false), url: theUrl };
            }
            await this.moveAndClick(page, `#${all[0]}`);
            return { linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false), url: theUrl };
        }
        catch (err) {
            return { linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false), url: theUrl };
        }
    }
}
exports.LinkedinLikeService = LinkedinLikeService;
//# sourceMappingURL=linkedin.like.service.js.map