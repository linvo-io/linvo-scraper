import { CDPSession, Page } from "puppeteer";

import { timer } from "../helpers/timer";

import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { LinkedinServicesInterface } from "./linkedin.services.interface";

export class LinkedinProfileViewsService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<{}>
{
  globalError() {
    return {
      text: "Could not scrape pages",
    };
  }
  async process(page: Page, cdp: CDPSession) {
    await page.goto("https://www.linkedin.com/analytics/profile-views/");
    await timer(3000);
    try {
      await timer(2000);
      const ppl = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            ".member-analytics-addon-entity-list__entity"
          )
        )?.map(
          (node) =>
            node
              .querySelector(
                ".member-analytics-addon-entity-list__entity-content-title"
              )
              ?.querySelector("span > span").textContent
        )
      );
      console.log(ppl);
    } catch (error) {
      console.error(error);
    }
  }
}
