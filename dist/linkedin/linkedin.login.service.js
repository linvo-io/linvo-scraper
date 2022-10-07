"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinLoginService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const timer_1 = require("../helpers/timer");
const linkedin_errors_1 = require("../enums/linkedin.errors");
class LinkedinLoginService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async process(page, cdp, data) {
        var _a, _b, _c, _d;
        try {
            await page.goto("https://www.linkedin.com/login");
            await page.waitForSelector("#username");
            await (0, timer_1.timer)(4000);
            await ((_a = (await page.$("#username"))) === null || _a === void 0 ? void 0 : _a.type(data.user, { delay: 30 }));
            await (0, timer_1.timer)(500);
            await ((_b = (await page.$("#password"))) === null || _b === void 0 ? void 0 : _b.type(data.password, { delay: 30 }));
            await (0, timer_1.timer)(1000);
            await ((_c = (await page.$("button[type=submit]"))) === null || _c === void 0 ? void 0 : _c.click());
            await (0, timer_1.timer)(3000);
            await page.waitForSelector(".search-global-typeahead__input", {
                timeout: 30000,
            });
            const token = await page.cookies();
            return {
                user: data.user,
                token: (_d = token === null || token === void 0 ? void 0 : token.find((t) => t.name === "li_at")) === null || _d === void 0 ? void 0 : _d.value,
            };
        }
        catch (err) {
            throw new linkedin_errors_1.LinkedinErrors("Could not login to linkedin, please update you credentials", '/accounts', {
                values: linkedin_errors_1.LINKEDIN_ERRORS.INVALID_CREDENTIALS,
            });
        }
    }
}
exports.LinkedinLoginService = LinkedinLoginService;
//# sourceMappingURL=linkedin.login.service.js.map