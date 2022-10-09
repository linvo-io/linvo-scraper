"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinSalesPageService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const timer_1 = require("../helpers/timer");
class LinkedinSalesPageService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async salesNavChooser(page) {
        try {
            await page.waitForSelector(".action-select-contract", {
                visible: true
            });
            await page.click(".action-select-contract");
        }
        catch (err) { }
    }
    async pagesTask(page, url) {
        var _a, _b;
        await page.goto("https://www.linkedin.com/sales/index", {
            waitUntil: "networkidle2",
        });
        await page.waitForFunction(() => {
            return (window.location.href.indexOf("https://www.linkedin.com/sales/home") > -1);
        });
        await page.waitForSelector(".logo-text", {
            visible: true,
        });
        page.goto(url);
        this.salesNavChooser(page);
        const res = await page.waitForResponse(async (p) => {
            try {
                const text = await p.text();
                return ((p.headers()["content-type"] === "application/json" &&
                    text.indexOf("firstName") > -1 &&
                    text.indexOf("elements") > -1) ||
                    (p.headers()["content-type"] === "text/html" &&
                        text.split("<code").some((f) => {
                            return (f.indexOf("firstName") > -1 &&
                                f.indexOf("elements") > -1 &&
                                f.indexOf("premium") > -1 &&
                                f.indexOf("degree") > -1 &&
                                f.indexOf("summary") > -1 &&
                                f.indexOf("entityUrn") > -1);
                        })));
            }
            catch (err) {
                return false;
            }
        }, {
            timeout: 0,
        });
        const txt = (await res.text()).toString();
        const json = res.headers()["content-type"] === "application/json"
            ? await res.json()
            : await page.evaluate((val) => {
                var _a, _b, _c;
                const div = document.createElement("div");
                div.innerHTML = val;
                const findElements = (_a = Array.from(div.querySelectorAll("code"))) === null || _a === void 0 ? void 0 : _a.filter((a) => {
                    var _a, _b;
                    return ((_a = a === null || a === void 0 ? void 0 : a.textContent) === null || _a === void 0 ? void 0 : _a.indexOf("elements")) > -1 &&
                        ((_b = a === null || a === void 0 ? void 0 : a.textContent) === null || _b === void 0 ? void 0 : _b.indexOf("firstName")) > -1;
                });
                if (findElements.length === 0) {
                    return "{}";
                }
                return JSON.parse((_c = (_b = findElements[findElements.length - 1]) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim());
            }, txt);
        const { paging, elements } = json;
        return {
            pages: (paging === null || paging === void 0 ? void 0 : paging.total)
                ? Math.ceil((paging.total > 2500 ? 2500 : paging.total) / 25)
                : 0,
            values: ((_b = (_a = elements === null || elements === void 0 ? void 0 : elements.filter((f) => {
                var _a;
                return ((f === null || f === void 0 ? void 0 : f.firstName) && ((_a = f === null || f === void 0 ? void 0 : f.entityUrn) === null || _a === void 0 ? void 0 : _a.indexOf("fs_salesProfile")) > -1);
            })) === null || _a === void 0 ? void 0 : _a.map((e) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                return ({
                    premium: e === null || e === void 0 ? void 0 : e.premium,
                    connected: (e === null || e === void 0 ? void 0 : e.degree) === 1,
                    link: (_f = (_e = (_d = [(_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.entityUrn) === null || _a === void 0 ? void 0 : _a.split("(")[1]) === null || _b === void 0 ? void 0 : _b.split(",")[0]) === null || _c === void 0 ? void 0 : _c.trim()]) === null || _d === void 0 ? void 0 : _d.filter((f) => f)) === null || _e === void 0 ? void 0 : _e.map((f) => "https://www.linkedin.com/in/" + f)) === null || _f === void 0 ? void 0 : _f.find((a) => a),
                    name: e.firstName + " " + e.lastName,
                    image: ((_h = (_g = e === null || e === void 0 ? void 0 : e.profilePictureDisplayImage) === null || _g === void 0 ? void 0 : _g.artifacts) === null || _h === void 0 ? void 0 : _h.length)
                        ? (e === null || e === void 0 ? void 0 : e.profilePictureDisplayImage.rootUrl) +
                            ((_k = (_j = e === null || e === void 0 ? void 0 : e.profilePictureDisplayImage) === null || _j === void 0 ? void 0 : _j.artifacts[0]) === null || _k === void 0 ? void 0 : _k.fileIdentifyingUrlPathSegment)
                        : "",
                    description: (e === null || e === void 0 ? void 0 : e.summary) || "",
                });
            })) === null || _b === void 0 ? void 0 : _b.filter((f) => (f === null || f === void 0 ? void 0 : f.link) && (f === null || f === void 0 ? void 0 : f.name))) || [],
        };
        const val = await Promise.race([
            new Promise(async (res) => {
                try {
                    await page.waitForSelector(".search-results__no-results-message", {
                        timeout: 80000,
                    });
                    return 1;
                }
                catch (err) { }
                res(1);
            }),
            new Promise(async (res) => {
                try {
                    await page.waitForSelector(".mt4[data-scroll-into-view]", {
                        timeout: 80000,
                    });
                }
                catch (err) { }
                res(2);
            }),
            new Promise(async (res) => {
                try {
                    await page.waitForSelector("[data-scroll-into-view] dt", {
                        timeout: 80000,
                    });
                }
                catch (err) { }
                res(3);
            }),
        ]);
        if (val === 1) {
            return {
                values: [],
                pages: 0,
            };
        }
        await (0, timer_1.timer)(10000);
        for (let i = 1; i <= 7; i++) {
            await page.mouse.wheel({
                deltaY: 400,
            });
            await (0, timer_1.timer)(2000);
        }
        const values = await this.workOnResults(page);
        const deltaY = await page.evaluate(() => {
            return (document.documentElement.scrollHeight -
                document.documentElement.scrollTop -
                document.documentElement.clientHeight || 1);
        });
        await page.mouse.wheel({
            deltaY,
        });
        await (0, timer_1.timer)(5000);
        const pages = values.length
            ? await page.evaluate(() => {
                var _a, _b;
                return ((_b = (_a = document
                    .querySelector(".search-results__pagination-list li:last-child button, .artdeco-pagination__pages li:last-child button")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || 1;
            })
            : null;
        return {
            values,
            pages: pages === null ? null : +pages,
        };
    }
    async scrollTo(page, scrollName, time = 0) {
        if (time === 5) {
            return false;
        }
        const findIt = await page.evaluate((name) => {
            var _a;
            return !!((_a = document.querySelector(`[data-scroll-into-view="${name}"] dt, [id="${name}"]`)) === null || _a === void 0 ? void 0 : _a.textContent);
        }, scrollName);
        if (!findIt) {
            await this.moveMouseAndScroll(page, `[data-scroll-into-view="${scrollName}"], [id="${scrollName}"]`);
            await (0, timer_1.timer)(1000);
            return this.scrollTo(page, scrollName, time + 1);
        }
        return true;
    }
    async workOnResults(page) {
        const allAttributes = await page.evaluate(() => {
            const l = Array.from(document.querySelectorAll(".search-results__result-item")).map((p) => p.getAttribute("data-scroll-into-view"));
            if (l.length > 0) {
                return l;
            }
            return Array.from(document.querySelectorAll(".artdeco-entity-lockup")).map((p) => p.getAttribute("id"));
        });
        const arr = [];
        for (const scrollInto of allAttributes) {
            const find = await this.scrollTo(page, scrollInto);
            if (!find) {
                continue;
            }
            const info = await page.evaluate((val) => {
                var _a, _b, _c, _d, _e, _f, _g;
                const selector = document.querySelector(`[data-scroll-into-view="${val}"], [id="${val}"]`);
                const href = [
                    ...Array.from(selector === null || selector === void 0 ? void 0 : selector.querySelectorAll('a[href*="/sales/"]')),
                ].find((f) => f.children.length === 0);
                return {
                    name: (_a = href === null || href === void 0 ? void 0 : href.textContent) === null || _a === void 0 ? void 0 : _a.trim(),
                    link: (_c = (_b = href === null || href === void 0 ? void 0 : href.getAttribute("href")) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.split(",")[0].replace("/sales/people/", "/in/"),
                    image: (_d = selector === null || selector === void 0 ? void 0 : selector.querySelector("img")) === null || _d === void 0 ? void 0 : _d.getAttribute("src"),
                    description: ((_g = (_f = (_e = selector === null || selector === void 0 ? void 0 : selector.querySelector(".result-lockup__highlight-keyword")) === null || _e === void 0 ? void 0 : _e.innerText) === null || _f === void 0 ? void 0 : _f.trim()) === null || _g === void 0 ? void 0 : _g.split("\n")[0]) || "",
                };
            }, scrollInto);
            arr.push(info);
        }
        return arr.filter((f) => f.name && f.link);
    }
}
exports.LinkedinSalesPageService = LinkedinSalesPageService;
//# sourceMappingURL=linkedin.sales.page.service.js.map