import {
  CombinedData,
  LinkedinServicesInterface,
} from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
import {createLinkedinLink} from "../helpers/create.linkedin.url";
import {gotoUrl} from "../helpers/gotoUrl";
import {timer} from "../helpers/timer";
interface RequiredData {
  url: string;
}

export class LinkedinEndorseService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData>
{
  globalError() {
    return {
      text: "Could not endorse",
    };
  }

  async process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>) {
    const { url } = data;
    const theUrl = createLinkedinLink(url, true);

    try {
      gotoUrl(page, theUrl);

      await this.waitForLoader(page);

      await page.waitForSelector(
        ".pv-top-card--list > li, .pv-top-card__photo"
      );

      await timer(3000);

      const scrollSize = await page.evaluate(() => {
        return document.body.scrollHeight;
      });

      await page.mouse.wheel({
        deltaY: scrollSize,
      });

      await timer(3000);

      await page.waitForSelector(".pv-skill-categories-section", {
        visible: true,
        timeout: 7000,
      });

      await this.moveMouseAndScroll(
        page,
        ".pv-skill-categories-section",
        0,
        false,
        -200
      );

      await timer(4000);

      const newUrl = await page.evaluate(() => {
        return window.location.href;
      });

      const all = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll(
            ".pv-skill-entity__featured-endorse-button-shared:not(.pv-skill-entity__featured-endorse-button-shared--checked)"
          )
        )
          ?.map((p) => p.getAttribute("id"))
          .filter((f) => f);
      });

      if (!all.length) {
        return { linkedin_id: createLinkedinLink(newUrl, false), url: newUrl };
      }

      for (const id of all) {
        await this.moveAndClick(page, `#${id}`);

        await page.waitForSelector(".artdeco-hoverable-content__close-btn");
        await this.moveAndClick(page, `.artdeco-hoverable-content__close-btn`);

        await timer(2000);
      }

      return { linkedin_id: createLinkedinLink(newUrl, false), url: newUrl };
    } catch (err) {
      const newUrl = await page.evaluate(() => {
        return window.location.href;
      });

      return { linkedin_id: createLinkedinLink(newUrl, false), url: newUrl };
    }
  }
}
