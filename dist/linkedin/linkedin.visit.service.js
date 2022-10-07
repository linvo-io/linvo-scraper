"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinVisitService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const gotoUrl_1 = require("../helpers/gotoUrl");
const timer_1 = require("../helpers/timer");
const create_linkedin_url_1 = require("../helpers/create.linkedin.url");
class LinkedinVisitService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async process(page, cdp, data) {
        const { url } = data;
        const theUrl = url.indexOf("linkedin.com") !== -1
            ? url
            : `https://www.linkedin.com${data.url}`;
        (0, gotoUrl_1.gotoUrl)(page, theUrl);
        await this.waitForLoader(page);
        await page.waitForSelector(".pv-top-card--list > li, .pv-top-card__photo");
        await (0, timer_1.timer)(3000);
        const newUrl = await page.evaluate(() => {
            return window.location.href;
        });
        return { url: theUrl, linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false) };
    }
}
exports.LinkedinVisitService = LinkedinVisitService;
//# sourceMappingURL=linkedin.visit.service.js.map