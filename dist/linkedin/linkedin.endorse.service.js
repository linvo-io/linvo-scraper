"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinEndorseService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const create_linkedin_url_1 = require("../helpers/create.linkedin.url");
const gotoUrl_1 = require("../helpers/gotoUrl");
const timer_1 = require("../helpers/timer");
class LinkedinEndorseService extends linkedin_abstract_service_1.LinkedinAbstractService {
    globalError() {
        return {
            text: "Could not endorse",
        };
    }
    async process(page, cdp, data) {
        const { url } = data;
        const theUrl = (0, create_linkedin_url_1.createLinkedinLink)(url, true);
        try {
            (0, gotoUrl_1.gotoUrl)(page, theUrl);
            await this.waitForLoader(page);
            await page.waitForSelector(".pv-top-card--list > li, .pv-top-card__photo");
            await (0, timer_1.timer)(3000);
            const scrollSize = await page.evaluate(() => {
                return document.body.scrollHeight;
            });
            await page.mouse.wheel({
                deltaY: scrollSize,
            });
            await (0, timer_1.timer)(3000);
            await page.waitForSelector(".pv-skill-categories-section", {
                visible: true,
                timeout: 7000,
            });
            await this.moveMouseAndScroll(page, ".pv-skill-categories-section", 0, false, -200);
            await (0, timer_1.timer)(4000);
            const newUrl = await page.evaluate(() => {
                return window.location.href;
            });
            const all = await page.evaluate(() => {
                var _a;
                return (_a = Array.from(document.querySelectorAll(".pv-skill-entity__featured-endorse-button-shared:not(.pv-skill-entity__featured-endorse-button-shared--checked)"))) === null || _a === void 0 ? void 0 : _a.map((p) => p.getAttribute("id")).filter((f) => f);
            });
            if (!all.length) {
                return { linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false), url: newUrl };
            }
            for (const id of all) {
                await this.moveAndClick(page, `#${id}`);
                await page.waitForSelector(".artdeco-hoverable-content__close-btn");
                await this.moveAndClick(page, `.artdeco-hoverable-content__close-btn`);
                await (0, timer_1.timer)(2000);
            }
            return { linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false), url: newUrl };
        }
        catch (err) {
            const newUrl = await page.evaluate(() => {
                return window.location.href;
            });
            return { linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false), url: newUrl };
        }
    }
}
exports.LinkedinEndorseService = LinkedinEndorseService;
//# sourceMappingURL=linkedin.endorse.service.js.map