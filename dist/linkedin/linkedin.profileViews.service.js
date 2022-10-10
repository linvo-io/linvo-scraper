"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinProfileViewsService = void 0;
const autoScroll_1 = require("../helpers/autoScroll");
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
        try {
            await page.waitForSelector(".member-analytics-addon-entity-list__entity");
            await (0, autoScroll_1.autoScroll)(page);
            await (0, timer_1.timer)(2000);
            const ppl = await page.evaluate(() => {
                var _a;
                return (_a = Array.from(document.querySelectorAll(".member-analytics-addon-entity-list__entity"))) === null || _a === void 0 ? void 0 : _a.map((node) => {
                    var _a;
                    let person = node === null || node === void 0 ? void 0 : node.querySelector(".member-analytics-addon-entity-list__entity-content-title");
                    let x = person === null || person === void 0 ? void 0 : person.querySelector("span > span");
                    let name = x === null || x === void 0 ? void 0 : x.textContent.split(" ");
                    if (!name) {
                        let countString = person.textContent.trim().split(" ")[0];
                        return {
                            name: {
                                firstName: "Private Mode",
                                lastName: "Private Mode",
                                countString,
                            },
                        };
                    }
                    let picNode = (_a = node.querySelector("img")) === null || _a === void 0 ? void 0 : _a.getAttribute("src");
                    return {
                        name: { firstName: name[0], lastName: name[1] },
                        profilePicture: picNode,
                    };
                });
            });
            return ppl;
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.LinkedinProfileViewsService = LinkedinProfileViewsService;
//# sourceMappingURL=linkedin.profileViews.service.js.map