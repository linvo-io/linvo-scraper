"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinAcceptedConnectionsService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const gotoUrl_1 = require("../helpers/gotoUrl");
class LinkedinAcceptedConnectionsService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async process(page) {
        (0, gotoUrl_1.gotoUrl)(page, "https://www.linkedin.com/mynetwork/invite-connect/connections/");
        await this.waitForLoader(page);
        try {
            await page.waitForSelector(".mn-connection-card__details", {
                timeout: 10000,
            });
            return (await this.scrapeProfile(page)).map((m) => ({
                name: m.name,
                url: m.url,
            }));
        }
        catch (err) {
            return [];
        }
    }
    async scrapeProfile(page) {
        return page.evaluate(async (current) => {
            return Array.from(document.querySelectorAll("ul .mn-connection-card")).map((elm) => {
                var _a, _b, _c;
                return ({
                    name: (_b = (_a = elm
                        .querySelector(".mn-connection-card__name")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim(),
                    url: [
                        (_c = elm.querySelector("a")) === null || _c === void 0 ? void 0 : _c.getAttribute("href"),
                    ].reduce((all, url) => {
                        if (url[url.length - 1] === "/") {
                            return url.slice(0, -1);
                        }
                        return url;
                    }, ""),
                });
            });
        });
    }
}
exports.LinkedinAcceptedConnectionsService = LinkedinAcceptedConnectionsService;
//# sourceMappingURL=linkedin.accepted.connection.request.service.js.map