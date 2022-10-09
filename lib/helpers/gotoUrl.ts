import {Page} from "puppeteer";

export const gotoUrl = async (page: Page, url: string) => {
    try {
        await page.goto(url, {
            timeout: 0
        });
    }
    catch (err) {}
}