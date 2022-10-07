"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinMessagesFromChat = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const sentiment_1 = __importDefault(require("sentiment"));
const lodash_1 = require("lodash");
const gotoUrl_1 = require("../helpers/gotoUrl");
const timer_1 = require("../helpers/timer");
const analyzer = new sentiment_1.default();
class LinkedinMessagesFromChat extends linkedin_abstract_service_1.LinkedinAbstractService {
    async process(page) {
        (0, gotoUrl_1.gotoUrl)(page, "https://www.linkedin.com/messaging/");
        await this.waitForLoader(page);
        return this.continueGetAllMessagesFromChat(page);
    }
    async getMessagesList(page, lastName) {
        try {
            await page.waitForFunction((last) => {
                var _a, _b;
                return (last !==
                    ((_b = (_a = document === null || document === void 0 ? void 0 : document.querySelector('[data-control-name="topcard"] h2, .msg-entity-lockup__entity-title-wrapper h2')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()));
            }, { timeout: 10000 }, lastName);
            await page.waitForSelector(".msg-s-message-list__loader.hidden");
        }
        catch (err) {
            return;
        }
        const getName = await page.evaluate(() => {
            var _a, _b;
            return (((_b = (_a = document === null || document === void 0 ? void 0 : document.querySelector('[data-control-name="topcard"] h2, .msg-entity-lockup__entity-title-wrapper h2')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || "");
        });
        const time = (await page.evaluate((n) => {
            var _a, _b, _c, _d;
            return (_d = (_c = (_b = (_a = (Array.from(document.querySelectorAll("h3")) || [])) === null || _a === void 0 ? void 0 : _a.find((f) => { var _a, _b; return ((_b = (_a = f === null || f === void 0 ? void 0 : f.innerText) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.indexOf(n)) > -1; })) === null || _b === void 0 ? void 0 : _b.nextElementSibling) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim();
        }, getName)) || "";
        const img = (await page.evaluate((n) => {
            var _a, _b, _c, _d;
            return (_d = (_c = (_b = (_a = (Array.from(document.querySelectorAll("h3")) || [])) === null || _a === void 0 ? void 0 : _a.find((f) => { var _a, _b; return ((_b = (_a = f === null || f === void 0 ? void 0 : f.innerText) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.indexOf(n)) > -1; })) === null || _b === void 0 ? void 0 : _b.closest("li")) === null || _c === void 0 ? void 0 : _c.querySelector("img")) === null || _d === void 0 ? void 0 : _d.getAttribute("src");
        }, getName)) || '';
        const id = await page.evaluate(() => {
            var _a, _b;
            return (_b = (_a = document === null || document === void 0 ? void 0 : document.querySelector('[data-control-name="topcard"], .msg-thread__link-to-profile')) === null || _a === void 0 ? void 0 : _a.getAttribute("href")) === null || _b === void 0 ? void 0 : _b.trim();
        });
        const link = await page.evaluate(() => {
            return window.location.href;
        });
        const a = {
            id,
            name: getName,
            time,
            img,
            link,
            values: (await page.evaluate((theName) => {
                return (Array.from(document.querySelectorAll(".msg-s-message-list__event")) || []).reduce((all, current) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const top = (_b = (_a = current
                        .querySelector('[data-control-name="view_profile"], .msg-s-message-group__profile-link')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                    const time = (_e = (_d = (_c = Array.from(current.querySelectorAll("time"))) === null || _c === void 0 ? void 0 : _c.find((m) => { var _a; return ((_a = m === null || m === void 0 ? void 0 : m.textContent) === null || _a === void 0 ? void 0 : _a.indexOf(":")) > -1; })) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim();
                    if (top) {
                        all.push({
                            name: theName,
                            link: window.location.href,
                            time,
                            from: top === theName ? "Prospect" : "Me",
                            message: "",
                        });
                    }
                    const message = (_g = (_f = current
                        .querySelector("[data-event-urn] p")) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim();
                    all[all.length - 1] = Object.assign(Object.assign({}, all[all.length - 1]), { message: (" " + message).trim() });
                    return all;
                }, []);
            }, getName))
                .map((p) => (Object.assign(Object.assign({}, p), { sentiment: (p === null || p === void 0 ? void 0 : p.message) ? analyzer.analyze(p === null || p === void 0 ? void 0 : p.message).score : 0 })))
                .filter((p) => (p === null || p === void 0 ? void 0 : p.message) && (p === null || p === void 0 ? void 0 : p.name)),
        };
        console.log(a);
        return a;
    }
    async nextPerson(page, idList, name, language) {
        if (!idList.length) {
            return [];
        }
        const current = idList.shift();
        await this.moveAndClick(page, `#${current} .msg-conversation-card__body-row`);
        await (0, timer_1.timer)(2000);
        const load = await this.getMessagesList(page, name);
        return [
            ...((load === null || load === void 0 ? void 0 : load.id)
                ? [
                    {
                        id: load === null || load === void 0 ? void 0 : load.id,
                        time: load === null || load === void 0 ? void 0 : load.time,
                        name: (load === null || load === void 0 ? void 0 : load.name) || "",
                        link: (load === null || load === void 0 ? void 0 : load.link) || "",
                        list: load === null || load === void 0 ? void 0 : load.values,
                        img: (load === null || load === void 0 ? void 0 : load.img) || "",
                        language,
                    },
                ]
                : []),
            ...(await this.nextPerson(page, idList, (load === null || load === void 0 ? void 0 : load.name) || "", language)),
        ];
    }
    async totalVisibleElement(page) {
        return page.evaluate(() => {
            var _a, _b;
            const { height: elmHeight } = (_a = document
                .querySelector(".msg-conversations-container__conversations-list > li:not(:empty)")) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
            const { height: heightContainer } = (_b = document
                .querySelector(".msg-conversations-container__conversations-list")) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
            return Math.floor(heightContainer / elmHeight);
        });
    }
    async continueGetAllMessagesFromChat(page) {
        await page.waitForSelector(".msg-conversations-container__conversations-list > li:not(:empty)", {
            visible: true,
        });
        const visibility = await this.totalVisibleElement(page);
        const all = (0, lodash_1.shuffle)((await page.evaluate((vis) => {
            return Array.from(document.querySelectorAll(".msg-conversations-container__conversations-list > li:not(:empty):not(.msg-conversation-card--occluded)"))
                .map((f) => ({
                id: f.getAttribute("id"),
                filter: f.innerHTML.indexOf("InMail") > -1 ||
                    f.innerHTML.indexOf("LinkedIn Offer") > -1 ||
                    f.innerHTML.indexOf("Sponsored") > -1,
            }))
                .filter((f) => (f.id || "").indexOf("ember") > -1)
                .slice(0, vis);
        }, visibility))
            .filter((f) => !f.filter)
            .map((p) => p.id));
        const language = await page.evaluate(() => {
            var _a, _b;
            return (_b = (_a = document
                .querySelector('meta[name="i18nLocale"]')) === null || _a === void 0 ? void 0 : _a.getAttribute("content")) === null || _b === void 0 ? void 0 : _b.split("_")[0];
        });
        return (await this.nextPerson(page, all, "", language)).filter((f) => (f === null || f === void 0 ? void 0 : f.name) && (f === null || f === void 0 ? void 0 : f.list.length));
    }
}
exports.LinkedinMessagesFromChat = LinkedinMessagesFromChat;
//# sourceMappingURL=linkedin.messages.from.chat.js.map