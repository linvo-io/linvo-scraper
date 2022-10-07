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

export class LinkedinLikeService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData>
{
  async process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>) {
    const { url } = data;
    const theUrl = createLinkedinLink(url, true);

    gotoUrl(page, theUrl);

    await this.waitForLoader(page);

    await timer(8000);

    const onlyUrl = await page.evaluate(() => {
      return window.location.href;
    });

    await page.goto("about:blank");

    const newUrl = createLinkedinLink(onlyUrl, false);

    gotoUrl(page, onlyUrl + "/detail/recent-activity/shares/");

    try {
      await this.waitForLoader(page);

      await page.waitForSelector(".social-actions-button", {
        visible: true,
        timeout: 7000,
      });

      const all = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("[data-urn]"))
            // @ts-ignore
          ?.reduce((all, current) => {
            return [
              ...all,
              current
                ?.querySelector(".social-actions-button")
                ?.getAttribute("id"),
            ];
          }, [])
            // @ts-ignore
            ?.filter((f) => f)
          ?.slice(0, 1);
      }, []);

      if (!all.length) {
        return { linkedin_id: createLinkedinLink(newUrl, false), url: theUrl };
      }

      await this.moveAndClick(page, `#${all[0]}`);

      return { linkedin_id: createLinkedinLink(newUrl, false), url: theUrl };
    } catch (err) {
      return { linkedin_id: createLinkedinLink(newUrl, false), url: theUrl };
    }
    // const newUrl = await page.evaluate(() => {
    //   return window.location.href;
    // });
    //
    // return { linkedin_id: createLinkedinLink(newUrl, false), url: theUrl};
  }
}
