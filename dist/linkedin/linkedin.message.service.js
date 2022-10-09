"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinMessageService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const string_similarity_1 = require("string-similarity");
const sentiment_1 = __importDefault(require("sentiment"));
const moment_1 = __importDefault(require("moment"));
const gotoUrl_1 = require("../helpers/gotoUrl");
const timer_1 = require("../helpers/timer");
const linkedin_errors_1 = require("../enums/linkedin.errors");
const analyzer = new sentiment_1.default();
class LinkedinMessageService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async findInChat(page, name) {
        return page.evaluate((name) => {
            var _a, _b;
            return (_b = (_a = Array.from(document.querySelectorAll("h3"))
                .find((f) => {
                return (name.indexOf(f.innerText.trim()) > -1 ||
                    f.innerText.trim().indexOf(name) > -1);
            })) === null || _a === void 0 ? void 0 : _a.closest("li")) === null || _b === void 0 ? void 0 : _b.getAttribute("id");
        }, name);
    }
    async process(page, cdp, data) {
        (0, gotoUrl_1.gotoUrl)(page, data.url
            ? data.url.indexOf("linkedin.com") > -1
                ? data.url
                : "https://www.linkedin.com" + data.url
            : "https://www.linkedin.com/messaging/");
        await this.waitForLoader(page);
        const { name, IgnoreProspectMessages, message } = data;
        if (!data.url) {
            await page.waitForSelector('[type="search-icon"] svg');
            await page.evaluate(() => {
                return document.querySelectorAll(".msg-conversations-container__conversations-list .msg-conversation-listitem").length;
            });
            await page.waitForSelector('input[name="searchTerm"]');
            const findMessage = await this.findInChat(page, name);
            if (!findMessage) {
                await this.moveAndClick(page, 'input[name="searchTerm"]');
                await page.type('input[name="searchTerm"]', name, {
                    delay: 10,
                });
                await page.keyboard.press("Enter");
            }
            await page.waitForFunction((name) => {
                return Array.from(document.querySelectorAll("h3")).some((f) => {
                    return (name.indexOf(f.innerText.trim()) > -1 ||
                        f.innerText.trim().indexOf(name) > -1);
                });
            }, {}, name);
            await (0, timer_1.timer)(5000);
            const findHandle = await this.findInChat(page, name);
            if (!findHandle) {
                throw new linkedin_errors_1.LinkedinErrors("Could not find message in the chat");
            }
            await page.evaluate((m) => {
                var _a;
                return (_a = document.querySelector(`${m} a`)) === null || _a === void 0 ? void 0 : _a.click();
            }, `#${findHandle}`);
            await (0, timer_1.timer)(10000);
        }
        await page.waitForSelector('[contenteditable="true"]');
        await (0, timer_1.timer)(5000);
        const list = await this.getMessagesList(page, "");
        const onlyMyMessages = list.values.filter((f) => f.from === "Me");
        const messageRanking = onlyMyMessages.length === 0
            ? 0
            : (0, string_similarity_1.findBestMatch)(message, onlyMyMessages.map((f) => f.message)).bestMatch.rating;
        if (!((IgnoreProspectMessages === 2 &&
            list.values.some((f) => f.from === "Prospect")) ||
            (IgnoreProspectMessages === 1 &&
                !list.values.some((f) => f.from === "Prospect")) ||
            IgnoreProspectMessages === 0)) {
            throw new linkedin_errors_1.LinkedinErrors("Prospect Already Replied");
        }
        if (onlyMyMessages.some((f) => f.message.indexOf(message) > -1) ||
            messageRanking > 0.9) {
            throw new linkedin_errors_1.LinkedinErrors("Duplicate Message Avoided");
        }
        await this.moveAndClick(page, '[contenteditable="true"]', undefined, 3);
        await (0, timer_1.timer)(2000);
        await page.evaluate((wText) => {
            document.execCommand("selectAll", false, undefined);
            document.execCommand("insertText", false, wText);
        }, message);
        await (0, timer_1.timer)(2000);
        await page.waitForFunction(() => {
            return document.querySelector(".msg-form__send-button:not(:disabled), .msg-form__hint-text");
        });
        const totalBefore = await page.evaluate(() => {
            return document.querySelectorAll(".msg-s-message-list__event").length;
        });
        const type = await page.evaluate(() => {
            var _a;
            return (_a = document
                .querySelector(".msg-form__send-button:not(:disabled), .msg-form__hint-text")) === null || _a === void 0 ? void 0 : _a.tagName.toLowerCase();
        });
        if (type === "button") {
            await this.moveAndClick(page, ".msg-form__send-button:not(:disabled), .msg-form__hint-text");
        }
        else {
            await page.keyboard.press('Enter');
        }
        await page.waitForFunction((before) => {
            return (document.querySelectorAll(".msg-s-message-list__event").length !==
                before);
        }, {}, totalBefore);
        return {
            info: Object.assign(Object.assign({}, data.info), { name }),
            messages: await this.getMessagesList(page, ""),
            name: await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".msg-conversation-listitem__participant-names")).map((p) => { var _a; return (_a = p === null || p === void 0 ? void 0 : p.textContent) === null || _a === void 0 ? void 0 : _a.trim(); });
            }),
        };
    }
    async getMessagesList(page, lastName) {
        try {
            await page.waitForFunction((last) => {
                var _a, _b;
                return (last !==
                    ((_b = (_a = document === null || document === void 0 ? void 0 : document.querySelector('[data-control-name="topcard"] h2, .msg-thread__link-to-profile h2')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()));
            }, { timeout: 10000 }, lastName);
        }
        catch (err) {
            return {
                time: "none",
                name: "none",
                values: [],
            };
        }
        await page.waitForSelector(".msg-s-message-list__loader.hidden");
        const getName = await page.evaluate(() => {
            var _a, _b;
            return (_b = (_a = document === null || document === void 0 ? void 0 : document.querySelector('[data-control-name="topcard"] h2, .msg-thread__link-to-profile h2')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
        });
        return {
            name: getName,
            time: (0, moment_1.default)().utc().format("YYYY-MM-DD HH:mm:ss"),
            values: (await page.evaluate((theName) => {
                return Array.from(document.querySelectorAll(".msg-s-message-list__event")).reduce((all, current) => {
                    var _a, _b, _c, _d, _e;
                    const top = (_b = (_a = current
                        .querySelector('[data-control-name="view_profile"], .msg-s-message-group__name,  .msg-s-message-group__profile-link')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
                    if (top) {
                        all.push({
                            name: theName,
                            link: (_c = window === null || window === void 0 ? void 0 : window.location) === null || _c === void 0 ? void 0 : _c.href,
                            from: top === theName ? "Prospect" : "Me",
                            message: "",
                        });
                    }
                    const message = (_e = (_d = current
                        .querySelector("[data-event-urn] p")) === null || _d === void 0 ? void 0 : _d.textContent) === null || _e === void 0 ? void 0 : _e.trim();
                    if (message) {
                        all[all.length - 1].message += " " + message;
                        all[all.length - 1].message = all[all.length - 1].message.trim();
                    }
                    return all;
                }, []);
            }, getName)).map((p) => (Object.assign(Object.assign({}, p), { sentiment: analyzer.analyze(p.message).score }))),
        };
    }
}
exports.LinkedinMessageService = LinkedinMessageService;
//# sourceMappingURL=linkedin.message.service.js.map