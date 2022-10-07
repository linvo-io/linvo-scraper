"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinAbstractService = void 0;
const messages_service_1 = require("../helpers/messages.service");
const timer_1 = require("../helpers/timer");
const linkedin_errors_1 = require("../enums/linkedin.errors");
const capitalize_1 = require("../helpers/capitalize");
class LinkedinAbstractService extends messages_service_1.MessagesService {
    async extractEmail(page) {
        await page.waitForSelector(".artdeco-modal", {
            visible: true,
        });
        await (0, timer_1.timer)(10000);
        const email = await page.evaluate(() => {
            var _a, _b;
            const modalText = (_b = (_a = document === null || document === void 0 ? void 0 : document.querySelector(".artdeco-modal")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
            return modalText === null || modalText === void 0 ? void 0 : modalText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
        });
        const phone = await page.evaluate(() => {
            var _a, _b, _c;
            return (_c = Array.from(((_b = (((_a = document
                .querySelector('.artdeco-modal [type="phone-handset-icon"]')) === null || _a === void 0 ? void 0 : _a.closest("section")) || document.querySelector(".ci-phone"))) === null || _b === void 0 ? void 0 : _b.querySelectorAll("li")) || [])) === null || _c === void 0 ? void 0 : _c.map((curr) => {
                var _a, _b;
                const [phone, type] = Array.from(curr === null || curr === void 0 ? void 0 : curr.querySelectorAll("span"));
                return {
                    phone: (_a = phone === null || phone === void 0 ? void 0 : phone.innerText) === null || _a === void 0 ? void 0 : _a.trim(),
                    type: (_b = type === null || type === void 0 ? void 0 : type.innerText) === null || _b === void 0 ? void 0 : _b.trim().replace(/\)|\(/g, ""),
                };
            }).filter((f) => (f === null || f === void 0 ? void 0 : f.phone) && (f === null || f === void 0 ? void 0 : f.type));
        }, []);
        const im = await page.evaluate(() => {
            var _a, _b, _c;
            return (_c = Array.from(((_b = (((_a = document
                .querySelector('.artdeco-modal [type="speech-bubble-icon"]')) === null || _a === void 0 ? void 0 : _a.closest("section")) || document.querySelector(".ci-ims"))) === null || _b === void 0 ? void 0 : _b.querySelectorAll("li")) || [])) === null || _c === void 0 ? void 0 : _c.map((curr) => {
                var _a, _b;
                const [phone, type] = Array.from(curr === null || curr === void 0 ? void 0 : curr.querySelectorAll("span"));
                return {
                    link: (_a = phone === null || phone === void 0 ? void 0 : phone.innerText) === null || _a === void 0 ? void 0 : _a.trim(),
                    type: (_b = type === null || type === void 0 ? void 0 : type.innerText) === null || _b === void 0 ? void 0 : _b.trim().replace(/\)|\(/g, ""),
                };
            }).filter((f) => (f === null || f === void 0 ? void 0 : f.link) && (f === null || f === void 0 ? void 0 : f.type));
        }, []);
        const websites = await page.evaluate(() => {
            var _a, _b, _c, _d;
            return (_d = (_c = Array.from(((_b = (((_a = document
                .querySelector('.artdeco-modal [type="link-icon"]')) === null || _a === void 0 ? void 0 : _a.closest("section")) || document.querySelector(".ci-websites"))) === null || _b === void 0 ? void 0 : _b.querySelectorAll("li")) || [])) === null || _c === void 0 ? void 0 : _c.map((curr) => {
                var _a, _b;
                const [website, type] = [
                    curr.querySelector("a"),
                    curr.querySelector("span"),
                ];
                return {
                    link: (_a = website === null || website === void 0 ? void 0 : website.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.trim(),
                    type: (_b = type === null || type === void 0 ? void 0 : type.innerText) === null || _b === void 0 ? void 0 : _b.trim().replace(/\)|\(/g, ""),
                };
            })) === null || _d === void 0 ? void 0 : _d.filter((f) => (f === null || f === void 0 ? void 0 : f.link) && (f === null || f === void 0 ? void 0 : f.type));
        }, []);
        const birthDay = await page.evaluate(() => {
            var _a, _b, _c, _d;
            return (((_d = (_c = (_b = (((_a = document
                .querySelector('.artdeco-modal [type="cake-icon"]')) === null || _a === void 0 ? void 0 : _a.closest("section")) || document.querySelector(".ci-birthday"))) === null || _b === void 0 ? void 0 : _b.querySelector("span")) === null || _c === void 0 ? void 0 : _c.innerText) === null || _d === void 0 ? void 0 : _d.trim()) || "");
        }, []);
        const twitter = await page.evaluate(() => {
            var _a, _b, _c;
            return (((_c = (_b = (((_a = document
                .querySelector('.artdeco-modal [type="twitter-icon"]')) === null || _a === void 0 ? void 0 : _a.closest("section")) || document.querySelector(".ci-twitter"))) === null || _b === void 0 ? void 0 : _b.querySelector("a")) === null || _c === void 0 ? void 0 : _c.getAttribute("href")) || "");
        }, []);
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ((email === null || email === void 0 ? void 0 : email.length) ? { email: email[0] } : {})), ((phone === null || phone === void 0 ? void 0 : phone.length) ? { phone } : {})), ((websites === null || websites === void 0 ? void 0 : websites.length) ? { websites } : {})), ((twitter === null || twitter === void 0 ? void 0 : twitter.length) ? { twitter } : {})), ((im === null || im === void 0 ? void 0 : im.length) ? { im } : {})), ((birthDay === null || birthDay === void 0 ? void 0 : birthDay.length) ? { birthDay } : {}));
    }
    async moveMouseAndScroll(page, selector, timeout, disabledMouseMove, offset = 0) {
        await page.waitForSelector(selector, { visible: true, timeout });
        const cur = page.cursor;
        const pos = await page.evaluate((elm) => {
            var _a;
            const { top, y, height } = (_a = document === null || document === void 0 ? void 0 : document.querySelector(elm)) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
            return { top, y, height };
        }, selector);
        try {
            await cur.moveTo({
                y: pos.y + pos.height + offset,
                x: (0, timer_1.randomIntFromInterval)(300, 1000),
            });
            await page.mouse.wheel({
                deltaY: pos.top + offset,
            });
        }
        catch (err) { }
        await (0, timer_1.timer)(300);
        if (!disabledMouseMove) {
            try {
                await cur.move(selector, {
                    moveDelay: 300,
                    paddingPercentage: 30,
                    waitForSelector: 200,
                });
            }
            catch (err) { }
        }
        await (0, timer_1.timer)(1000);
    }
    static async checkLimit(page) {
        const options = [
            {
                char: "You’ve reached the weekly invitation limit",
                message: "You’ve reached the weekly invitation limit",
                delay: 1440,
                type: "Connect",
            },
            {
                char: "Too Many Requests",
                message: "Too Many Search Requests",
                delay: 120,
                type: "Connect",
            },
            {
                char: "You’re out of invitations for now",
                message: "You’re out of invitations for now",
                delay: 1440,
                type: "Connect",
            },
            {
                char: "Drive more leads and bigger deals with Sales Navigator",
                message: "User doesn't have Linkedin sales nav",
                delay: 1440,
                type: "Connect",
            },
            {
                char: "reached the weekly invitation limit",
                message: "You’ve reached the weekly invitation limit",
                delay: 1440,
                type: "Connect",
            },
            {
                char: "Search limit reached",
                message: "Search limit reached",
                delay: 120,
                type: "Page",
            },
            {
                char: "quick security check",
                message: "Verification Screen",
                delay: 120,
                type: "All",
            },
            {
                char: "we have restricted your account until",
                message: "Account Restricted until some date",
                delay: 100000000,
                type: "restrictions",
            },
            {
                char: "Your account has been restricted",
                message: "Account Restricted",
                delay: 100000000,
                type: "restrictions",
            },
            {
                char: "unusual activity from your account",
                message: "Unusual activity from account",
                delay: 100000000,
                type: "restrictions",
            },
        ];
        const isLimitedReached = (await page.evaluate((optionList) => {
            var _a, _b;
            const body = (_b = (_a = document.querySelector("body")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim();
            return optionList.map((option) => (Object.assign(Object.assign({}, option), { char: body === null || body === void 0 ? void 0 : body.indexOf(option.char) })));
        }, options)).filter((f) => f.char && f.char !== -1);
        if (isLimitedReached.length) {
            throw new linkedin_errors_1.LinkedinErrors(`We have postpone your account activity, We got from Linkedin ${isLimitedReached[0].message}`, undefined, { values: linkedin_errors_1.LINKEDIN_ERRORS.DELAY, more: isLimitedReached[0].delay });
        }
    }
    static async checkToken(page) {
        const cookies = await page.cookies('https://www.linkedin.com');
        if ((cookies === null || cookies === void 0 ? void 0 : cookies.length) && !(cookies === null || cookies === void 0 ? void 0 : cookies.some(c => c.name === 'li_at'))) {
            throw new linkedin_errors_1.LinkedinErrors("Your user have been disconnected", undefined, {
                values: linkedin_errors_1.LINKEDIN_ERRORS.DISCONNECTED,
            });
        }
    }
    async extractInformation(page) {
        await page.mouse.wheel({
            deltaY: 200,
        });
        await page.mouse.wheel({
            deltaY: 200,
        });
        await page.mouse.wheel({
            deltaY: 200,
        });
        await page.mouse.wheel({
            deltaY: 200,
        });
        const info = await page.evaluate(() => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
            const profilePicture = (_a = document
                .querySelector(".pv-top-card__photo")) === null || _a === void 0 ? void 0 : _a.getAttribute("src");
            const name = (_d = (_c = (_b = ((document === null || document === void 0 ? void 0 : document.querySelector(".text-heading-xlarge")) ||
                (document === null || document === void 0 ? void 0 : document.querySelector(".pv-top-card--list > li")) || {
                textContent: "",
            })) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim()) === null || _d === void 0 ? void 0 : _d.split(" ");
            const companyName = (_f = (_e = (document.querySelector(".pv-text-details__right-panel h2") ||
                document.querySelector(".pv-top-card--experience-list-item") || {
                textContent: "",
            })) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim();
            const locationNew = (_h = (_g = (document.querySelector(".artdeco-card .pb2 > span") ||
                document.querySelector(".pv3 > span") ||
                document.querySelector(".pv-top-card h2 + ul > li"))) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim();
            const headline = (_k = (_j = (document.querySelector(".text-body-medium") ||
                document.querySelector(".pv-top-card h2"))) === null || _j === void 0 ? void 0 : _j.textContent) === null || _k === void 0 ? void 0 : _k.trim();
            const currentCompanyPicture = (_l = document
                .querySelector(".pv-position-entity img")) === null || _l === void 0 ? void 0 : _l.getAttribute("src");
            const currentPositionLength = ((_o = (_m = document
                .querySelector(".pv-entity__company-details .t-normal > span:last-child")) === null || _m === void 0 ? void 0 : _m.textContent) === null || _o === void 0 ? void 0 : _o.trim()) ||
                ((_q = (_p = document
                    .querySelector(".pv-entity__date-range + h4 > span:last-child")) === null || _p === void 0 ? void 0 : _p.textContent) === null || _q === void 0 ? void 0 : _q.trim());
            const currentTitle = ((_s = (_r = document
                .querySelector(".pv-profile-section__section-info > li:first-child .pv-entity__role-details-container--timeline h3 > span:last-child")) === null || _r === void 0 ? void 0 : _r.textContent) === null || _s === void 0 ? void 0 : _s.trim()) ||
                ((_u = (_t = document
                    .querySelector(".pv-profile-section__section-info > li:first-child h3")) === null || _t === void 0 ? void 0 : _t.textContent) === null || _u === void 0 ? void 0 : _u.trim());
            return {
                currentCompanyPicture,
                currentTitle,
                currentPositionLength,
                headline,
                location: locationNew,
                profilePicture,
                name: (name === null || name === void 0 ? void 0 : name.length) ? name[0] : '',
                last_name: (name === null || name === void 0 ? void 0 : name.length) ? name[1] : '',
                companyName,
            };
        });
        await page.mouse.wheel({
            deltaY: -200,
        });
        await page.mouse.wheel({
            deltaY: -200,
        });
        await page.mouse.wheel({
            deltaY: -200,
        });
        await page.mouse.wheel({
            deltaY: -200,
        });
        await (0, timer_1.timer)(3000);
        return info;
    }
    async moveAndClick(page, select, timeout, totalClicks) {
        const selector = typeof select === "string" ? select : select.selector;
        const offset = typeof select === "string"
            ? 0
            : await page.evaluate((el) => {
                var _a;
                return ((_a = document.querySelector(el)) === null || _a === void 0 ? void 0 : _a.offsetTop) || 0;
            }, select.container);
        const gotSelector = "[Got Selector]".cyan() + " " + selector.blue();
        await page.waitForSelector(selector, { visible: true, timeout });
        await (0, timer_1.timer)((0, timer_1.randomIntFromInterval)(200, 444));
        const elm = await page.$(selector);
        if (elm) {
            const pos = await elm.boundingBox();
            const cur = page.cursor;
            try {
                await cur.moveTo({
                    x: pos.x + pos.width / 2,
                    y: pos.y - offset + pos.height / 2,
                });
            }
            catch (err) {
                try {
                    await cur.move(gotSelector);
                }
                catch (err) { }
            }
            try {
                await page.mouse.click(pos.x + pos.width / 2, pos.y - offset + pos.height / 2, {
                    clickCount: totalClicks
                });
            }
            catch (err) {
                try {
                    await page.click(selector, {
                        clickCount: totalClicks
                    });
                }
                catch (err) { }
            }
            return elm;
        }
        return page.evaluate((elm) => {
            document.querySelector(elm).click();
        }, selector);
    }
    generateMessage(message, params) {
        return this.createMessage(message, [
            { label: "name", value: (0, capitalize_1.capitalize)(params.firstName) },
            { label: "last_name", value: (0, capitalize_1.capitalize)(params.lastName) },
            { label: "lastname", value: (0, capitalize_1.capitalize)(params.lastName) },
            { label: "myname", value: (0, capitalize_1.capitalize)(params.myname) },
            { label: "mylastname", value: (0, capitalize_1.capitalize)(params.mylastname) },
            { label: "mycompany", value: (0, capitalize_1.capitalize)(params.mycompany) },
            { label: "company", value: params.companyName },
        ]);
    }
    async waitForLoader(page) {
        try {
            await page.waitForSelector(".initial-load-animation:not(.fade-load)", {
                visible: true,
                timeout: 10000,
            });
            await page.waitForSelector(".initial-load-animation.fade-load", {
                timeout: 0,
            });
        }
        catch (err) { }
        await (0, timer_1.timer)(3000);
    }
    async selectContract(page) {
        try {
            await page.waitForSelector(".contract-list .action-select-contract", {
                timeout: 0,
            });
            await this.moveAndClick(page, ".contract-list .action-select-contract", 0);
        }
        catch (err) { }
    }
    async waitForSalesLoader(page) {
        await page.waitForSelector(".initial-load-animation:not(.fade-load)", {
            visible: true,
            timeout: 60000,
        });
        await page.waitForSelector(".initial-loading-state.hide-loading", {
            timeout: 300000,
        });
        await (0, timer_1.timer)(3000);
    }
}
exports.LinkedinAbstractService = LinkedinAbstractService;
//# sourceMappingURL=linkedin.abstract.service.js.map