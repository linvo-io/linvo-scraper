"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinProfileViewsService = void 0;
const timer_1 = require("../helpers/timer");
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
class LinkedinProfileViewsService extends linkedin_abstract_service_1.LinkedinAbstractService {
    globalError() {
        return {
            text: "Could not scrape pages",
        };
    }
    async process(page, cdp) {
        await page.goto("https://www.linkedin.com/analytics/profile-views/");
        await (0, timer_1.timer)(3000);
        try {
            await (0, timer_1.timer)(2000);
            const ppl = await page.evaluate(() => {
                var _a;
                return (_a = Array.from(document.querySelectorAll(".member-analytics-addon-entity-list__entity"))) === null || _a === void 0 ? void 0 : _a.map((node) => {
                    var _a;
                    return (_a = node
                        .querySelector(".member-analytics-addon-entity-list__entity-content-title")) === null || _a === void 0 ? void 0 : _a.querySelector("span > span").textContent;
                });
            });
            console.log(ppl);
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.LinkedinProfileViewsService = LinkedinProfileViewsService;
//# sourceMappingURL=linkedin.profileViews.service.js.map