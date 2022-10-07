"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinEmailService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const create_linkedin_url_1 = require("../helpers/create.linkedin.url");
const gotoUrl_1 = require("../helpers/gotoUrl");
const timer_1 = require("../helpers/timer");
class LinkedinEmailService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async process(page, cdp, data) {
        const { url } = data;
        const theUrl = (0, create_linkedin_url_1.createLinkedinLink)(url, true);
        try {
            (0, gotoUrl_1.gotoUrl)(page, theUrl);
            await this.waitForLoader(page);
            await (0, timer_1.timer)(3000);
            const newUrl = await page.evaluate(() => {
                return window.location.href;
            });
            await page.evaluate(() => {
                history.pushState({}, '', window.location.href + 'overlay/contact-info/');
                history.pushState({}, '', window.location.href + 'overlay/contact-info/');
                history.back();
            });
            return Object.assign(Object.assign({}, await this.extractEmail(page)), { url: theUrl, linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false) });
        }
        catch (err) {
            const newUrl = await page.evaluate(() => {
                return window.location.href;
            });
            return { url: theUrl, linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false) };
        }
    }
}
exports.LinkedinEmailService = LinkedinEmailService;
//# sourceMappingURL=linkedin.email.service.js.map