"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinPageService = void 0;
const linkedin_abstract_service_1 = require("./linkedin.abstract.service");
const timer_1 = require("../helpers/timer");
class LinkedinPageService extends linkedin_abstract_service_1.LinkedinAbstractService {
    async elements(page, index) {
        if (index === 1) {
            await page.waitForSelector(`.artdeco-card ul li:nth-child(${index})`);
        }
        else {
            if (!(await page.$(`.artdeco-card ul li:nth-child(${index})`))) {
                return [];
            }
        }
        await this.moveMouseAndScroll(page, `.artdeco-card ul li:nth-child(${index})`);
        const list = await page.evaluate((cur) => {
            var _a, _b, _c;
            const element = document.querySelector(`.artdeco-card ul li:nth-child(${cur})`);
            if (!element) {
                return undefined;
            }
            const button = element.querySelector("button");
            if (!button || !(button === null || button === void 0 ? void 0 : button.getAttribute("class"))) {
                return [];
            }
            const connect = ((_a = button.getAttribute("class")) === null || _a === void 0 ? void 0 : _a.indexOf("muted")) === -1;
            const nameElement = element.querySelector(".actor-name") ||
                element.querySelector(".discover-person-card__name") ||
                element.querySelector('.entity-result__title-text [data-control-name="entity_result"]') ||
                element.querySelector(".entity-result__title-text") ||
                element.querySelector(".artdeco-entity-lockup__title");
            const descriptionElement = element.querySelector(".search-result__info > p") ||
                element.querySelector(".discover-person-card__occupation") ||
                element.querySelector(".entity-result__primary-subtitle") ||
                element.querySelector(".artdeco-entity-lockup__subtitle");
            const imgElement = element.querySelector("img.discover-entity-type-card__image-circle") ||
                element.querySelector("img");
            const name = nameElement === null || nameElement === void 0 ? void 0 : nameElement.innerText.trim().split("\n")[0];
            const link = (_b = element === null || element === void 0 ? void 0 : element.querySelector('a[href*="/in/"]')) === null || _b === void 0 ? void 0 : _b.getAttribute("href");
            const description = (_c = descriptionElement === null || descriptionElement === void 0 ? void 0 : descriptionElement.textContent) === null || _c === void 0 ? void 0 : _c.trim();
            return [
                {
                    name,
                    link,
                    image: imgElement ? imgElement.getAttribute("src") : "",
                    description,
                    connect,
                },
            ];
        }, index);
        if (!list) {
            return [];
        }
        return [...list, ...(await this.elements(page, index + 1))];
    }
    async pagesTask(page, url) {
        var _a, _b, _c, _d, _e;
        const goto = await page.goto(url);
        const json = await page.evaluate((val) => {
            var _a, _b, _c;
            const div = document.createElement("div");
            div.innerHTML = val;
            const findElements = (_a = Array.from(div.querySelectorAll("code"))) === null || _a === void 0 ? void 0 : _a.filter((a) => {
                var _a, _b;
                return ((_a = a === null || a === void 0 ? void 0 : a.textContent) === null || _a === void 0 ? void 0 : _a.indexOf("elements")) > -1 &&
                    ((_b = a === null || a === void 0 ? void 0 : a.textContent) === null || _b === void 0 ? void 0 : _b.indexOf("totalResultCount")) > -1;
            });
            if (findElements.length === 0) {
                return "{}";
            }
            return (_c = (_b = findElements[findElements.length - 1]) === null || _b === void 0 ? void 0 : _b.textContent) === null || _c === void 0 ? void 0 : _c.trim();
        }, (_a = (await (goto === null || goto === void 0 ? void 0 : goto.buffer()))) === null || _a === void 0 ? void 0 : _a.toString());
        const { included, data } = JSON.parse(json || "{}");
        if (!data || !included) {
            return {
                pages: 0,
                values: [],
            };
        }
        return {
            pages: Math.ceil((((_b = data === null || data === void 0 ? void 0 : data.metadata) === null || _b === void 0 ? void 0 : _b.totalResultCount) > 1000
                ? 1000
                : (_c = data === null || data === void 0 ? void 0 : data.metadata) === null || _c === void 0 ? void 0 : _c.totalResultCount) / 10),
            values: ((_e = (_d = included === null || included === void 0 ? void 0 : included.filter((f) => { var _a; return (_a = f === null || f === void 0 ? void 0 : f.title) === null || _a === void 0 ? void 0 : _a.text; })) === null || _d === void 0 ? void 0 : _d.map((f) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                return ({
                    name: (_a = f === null || f === void 0 ? void 0 : f.title) === null || _a === void 0 ? void 0 : _a.text,
                    link: f === null || f === void 0 ? void 0 : f.navigationUrl,
                    description: (_b = f === null || f === void 0 ? void 0 : f.primarySubtitle) === null || _b === void 0 ? void 0 : _b.text,
                    image: ((_g = (_f = (_e = (_d = (_c = f === null || f === void 0 ? void 0 : f.image) === null || _c === void 0 ? void 0 : _c.attributes[0]) === null || _d === void 0 ? void 0 : _d.detailDataUnion) === null || _e === void 0 ? void 0 : _e.nonEntityProfilePicture) === null || _f === void 0 ? void 0 : _f.vectorImage) === null || _g === void 0 ? void 0 : _g.rootUrl)
                        ? ((_h = f === null || f === void 0 ? void 0 : f.image) === null || _h === void 0 ? void 0 : _h.attributes[0].detailDataUnion.nonEntityProfilePicture.vectorImage.rootUrl) +
                            ((_j = f === null || f === void 0 ? void 0 : f.image) === null || _j === void 0 ? void 0 : _j.attributes[0].detailDataUnion.nonEntityProfilePicture.vectorImage.artifacts[0].fileIdentifyingUrlPathSegment)
                        : "",
                });
            })) === null || _e === void 0 ? void 0 : _e.filter((f) => (f === null || f === void 0 ? void 0 : f.name) && (f === null || f === void 0 ? void 0 : f.link) && (f === null || f === void 0 ? void 0 : f.link.indexOf("/in/")) > -1)) ||
                [],
        };
        await this.waitForLoader(page);
        await page.waitForSelector(".artdeco-card");
        await page.waitForSelector(`.actor-name, .discover-person-card__name, .entity-result__title-text [data-control-name="entity_result"], .entity-result__title-text`, {
            timeout: 5000,
        });
        await (0, timer_1.timer)(10000);
        const elements = await this.elements(page, 1);
        await (0, timer_1.timer)(200);
        const deltaY = await page.evaluate(() => {
            return document.body.scrollHeight;
        });
        await page.mouse.wheel({
            deltaY,
        });
        await (0, timer_1.timer)(3000);
        const pages = !elements.length
            ? null
            : await page.evaluate(() => {
                var _a, _b;
                return (((_b = (_a = document
                    .querySelector(".artdeco-pagination__pages li:last-child button")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || 1);
            });
        return {
            pages: pages === null ? 1 : +pages,
            values: elements,
        };
    }
}
exports.LinkedinPageService = LinkedinPageService;
//# sourceMappingURL=linkedin.page.service.js.map