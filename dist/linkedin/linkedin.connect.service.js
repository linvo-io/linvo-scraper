"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinConnectService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const create_linkedin_url_1 = require("../helpers/create.linkedin.url");
const gotoUrl_1 = require("../helpers/gotoUrl");
const timer_1 = require("../helpers/timer");
const linkedin_errors_1 = require("../enums/linkedin.errors");
class LinkedinConnectService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async process(page, cdp, data) {
        const { message, url } = data;
        const theUrl = (0, create_linkedin_url_1.createLinkedinLink)(url, true);
        (0, gotoUrl_1.gotoUrl)(page, theUrl);
        await this.waitForLoader(page);
        await page.waitForSelector(".pv-top-card--list > li, .pv-top-card__photo");
        await (0, timer_1.timer)(3000);
        const pending = await page.$("button.pv-s-profile-actions--connect:disabled, .message-anywhere-button.artdeco-button--primary");
        const pending2 = await page.evaluate(() => {
            return !!Array.from(document.querySelectorAll("button")).find((p) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
                return ((_c = (_b = (_a = p === null || p === void 0 ? void 0 : p.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.indexOf("pending")) > -1 ||
                    ((_f = (_e = (_d = p === null || p === void 0 ? void 0 : p.textContent) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === null || _e === void 0 ? void 0 : _e.trim()) === null || _f === void 0 ? void 0 : _f.indexOf("en attente")) > -1 ||
                    ((_j = (_h = (_g = p === null || p === void 0 ? void 0 : p.textContent) === null || _g === void 0 ? void 0 : _g.toLowerCase()) === null || _h === void 0 ? void 0 : _h.trim()) === null || _j === void 0 ? void 0 : _j.indexOf("待處理")) > -1 ||
                    ((_m = (_l = (_k = p === null || p === void 0 ? void 0 : p.textContent) === null || _k === void 0 ? void 0 : _k.toLowerCase()) === null || _l === void 0 ? void 0 : _l.trim()) === null || _m === void 0 ? void 0 : _m.indexOf("ausstehend")) > -1 ||
                    ((_q = (_p = (_o = p === null || p === void 0 ? void 0 : p.textContent) === null || _o === void 0 ? void 0 : _o.toLowerCase()) === null || _p === void 0 ? void 0 : _p.trim()) === null || _q === void 0 ? void 0 : _q.indexOf("nawiąż kontakt")) >
                        -1 ||
                    ((_t = (_s = (_r = p === null || p === void 0 ? void 0 : p.textContent) === null || _r === void 0 ? void 0 : _r.toLowerCase()) === null || _s === void 0 ? void 0 : _s.trim()) === null || _t === void 0 ? void 0 : _t.indexOf("in sospeso")) > -1;
            });
        });
        if (pending || pending2) {
            throw new linkedin_errors_1.LinkedinErrors("Connection is already pending");
        }
        const info = await this.extractInformation(page);
        await this.clickConnectButton(page);
        await (0, timer_1.timer)(3000);
        const email = await page.$("#email");
        if (email) {
            throw new linkedin_errors_1.LinkedinErrors("Linkedin Prompt Email Verification");
        }
        try {
            await page.waitForSelector('.artdeco-pill-choice-group button', {
                visible: true,
                timeout: 3000
            });
            await this.moveAndClick(page, '.artdeco-pill-choice-group button:nth-child(1)');
            await (0, timer_1.timer)(500);
            await this.moveAndClick(page, ".artdeco-modal__actionbar > button:nth-child(1)");
            await (0, timer_1.timer)(500);
        }
        catch (err) { }
        if (message) {
            await page.waitForSelector(".artdeco-modal", {
                visible: true,
            });
            await page.waitForSelector(".artdeco-modal__actionbar > button:nth-child(1)");
            const total = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".artdeco-modal__actionbar > button")).length;
            });
            if (total === 3) {
                await this.moveAndClick(page, ".artdeco-modal__actionbar > button:nth-child(1)");
                await (0, timer_1.timer)(500);
            }
            await this.moveAndClick(page, ".artdeco-modal__actionbar > button:nth-child(1)");
            try {
                await page.waitForSelector("textarea", {
                    timeout: 2000,
                });
            }
            catch (err) {
                await page.evaluate(() => {
                    var _a;
                    (_a = document
                        .querySelector(".artdeco-modal__actionbar > button:nth-child(1)")) === null || _a === void 0 ? void 0 : _a.click();
                });
                await page.waitForSelector("textarea");
            }
            const textArea = await this.moveAndClick(page, "textarea");
            const newMessage = await this.generateMessage(message, Object.assign({ firstName: info.name, lastName: info.last_name, companyName: info.companyName, profilePicture: info.profilePicture }, data.extra));
            await textArea.type(newMessage, {
                delay: 30,
            });
            await page.waitForFunction(() => {
                var _a;
                const find = document.querySelector(".artdeco-modal__actionbar > button:nth-child(2)");
                return (find &&
                    ((_a = find === null || find === void 0 ? void 0 : find.getAttribute("class")) === null || _a === void 0 ? void 0 : _a.indexOf("artdeco-button--disabled")) === -1);
            });
        }
        await this.moveAndClick(page, ".artdeco-modal__actionbar > button:nth-child(2)");
        try {
            await page.waitForFunction(() => {
                return !document.querySelector(".artdeco-modal__actionbar > button:nth-child(2)");
            }, {
                timeout: 1000,
            });
        }
        catch (err) { }
        const newUrl = await page.evaluate(() => {
            return window.location.href;
        });
        return {
            name: info.name + " " + info.last_name,
            currentCompanyPicture: info.currentCompanyPicture,
            companyName: info.companyName,
            current_position_title: info.currentTitle,
            location: info.location,
            headline: info.headline,
            current_position_length: info.currentPositionLength,
            url: theUrl,
            linkedin_id: (0, create_linkedin_url_1.createLinkedinLink)(newUrl, false),
        };
    }
    async connectMethod3(page) {
        await this.moveAndClick(page, ".pv-top-card button.artdeco-dropdown__trigger:not(:disabled)", 200);
        await (0, timer_1.timer)(800);
        await this.moveMouseAndScroll(page, '.pv-top-card [aria-label="Connect"], .pv-top-card div.pv-s-profile-actions--connect, .pv-top-card [data-control-name="connect"], .pv-top-card [type="connect-icon"]', 2000);
        await page.evaluate(() => {
            var _a;
            return ((_a = document
                .querySelector('.pv-top-card [aria-label="Connect"], .pv-top-card div.pv-s-profile-actions--connect, .pv-top-card [data-control-name="connect"], .pv-top-card [type="connect-icon"]')) === null || _a === void 0 ? void 0 : _a.click());
        });
    }
    async connectMethod2(page) {
        await this.moveAndClick(page, '.pv-top-card button.pv-s-profile-actions--connect:not(:disabled), [aria-label="Connect"], [data-control-name="connect"], .pvs-profile-actions__action:not(.artdeco-button--secondary):not([data-control-name="follow"]):not(.message-anywhere-button)');
    }
    async connectMethod4(page) {
        await this.moveAndClick(page, ".pv-top-card li-icon[type=connect] + span");
    }
    async connectMethod1(page) {
        const button = await page.evaluate(() => {
            var _a, _b;
            return (_b = (_a = Array.from(document.querySelectorAll(".pvs-profile-actions button"))) === null || _a === void 0 ? void 0 : _a.find((f) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                return ((_b = (_a = f === null || f === void 0 ? void 0 : f.innerText) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.indexOf("connect")) > -1 ||
                    ((_d = (_c = f === null || f === void 0 ? void 0 : f.innerText) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === null || _d === void 0 ? void 0 : _d.indexOf("conectar")) > -1 ||
                    ((_f = (_e = f === null || f === void 0 ? void 0 : f.innerText) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === null || _f === void 0 ? void 0 : _f.indexOf("collegati")) > -1 ||
                    ((_h = (_g = f === null || f === void 0 ? void 0 : f.innerText) === null || _g === void 0 ? void 0 : _g.toLowerCase()) === null || _h === void 0 ? void 0 : _h.indexOf("se connecter")) > -1 ||
                    ((_k = (_j = f === null || f === void 0 ? void 0 : f.innerText) === null || _j === void 0 ? void 0 : _j.toLowerCase()) === null || _k === void 0 ? void 0 : _k.indexOf("建立關係")) > -1 ||
                    ((_m = (_l = f === null || f === void 0 ? void 0 : f.innerText) === null || _l === void 0 ? void 0 : _l.toLowerCase()) === null || _m === void 0 ? void 0 : _m.indexOf("kur")) > -1 ||
                    ((_p = (_o = f === null || f === void 0 ? void 0 : f.innerText) === null || _o === void 0 ? void 0 : _o.toLowerCase()) === null || _p === void 0 ? void 0 : _p.indexOf("vernetzen")) > -1;
            })) === null || _b === void 0 ? void 0 : _b.getAttribute("id");
        });
        if (!button) {
            throw "";
        }
        await this.moveAndClick(page, `#${button}`);
    }
    async clickConnectButton(page) {
        try {
            await this.connectMethod1(page);
        }
        catch (err) {
            try {
                await this.connectMethod3(page);
            }
            catch (err) {
                try {
                    await this.connectMethod2(page);
                }
                catch (err) {
                    await this.connectMethod4(page);
                }
            }
        }
    }
}
exports.LinkedinConnectService = LinkedinConnectService;
//# sourceMappingURL=linkedin.connect.service.js.map