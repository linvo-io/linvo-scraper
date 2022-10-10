import { CDPSession, Page } from "puppeteer";
import { autoScroll } from "../helpers/autoScroll";
import { timer } from "../helpers/timer";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { LinkedinServicesInterface } from "./linkedin.services.interface";

export interface People {
  name: { firstName: String; lastName: String };
  profilePicture?: String;
  count?: String;
}
export class LinkedinProfileViewsService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<{}>
{
  globalError() {
    return {
      text: "Could not scrape pages",
    };
  }
  async process(page: Page, cdp: CDPSession): Promise<Array<People>> {
    await page.goto("https://www.linkedin.com/analytics/profile-views/");
    try {
      await page.waitForSelector(".member-analytics-addon-entity-list__entity");
      await autoScroll(page);
      await timer(2000);
      const ppl: Array<People> = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            ".member-analytics-addon-entity-list__entity"
          )
        )?.map((node) => {
          let person = node?.querySelector(
            ".member-analytics-addon-entity-list__entity-content-title"
          );
          let x = person?.querySelector("span > span");
          let name = x?.textContent.split(" ");
          if (!name) {
            let countString = person.textContent.trim().split(" ")[0];
            // BUG: The following two lines give and error because the string might not have been resolved yet
            // let count = parseInt(countString);
            // console.log(count);
            return {
              name: {
                firstName: "Private Mode",
                lastName: "Private Mode",
                countString,
              },
            };
          }
          let picNode = node.querySelector("img")?.getAttribute("src");
          return {
            name: { firstName: name[0], lastName: name[1] },
            profilePicture: picNode,
          };
        })
      );
      return ppl;
    } catch (error) {
      console.error(error);
    }
  }
}
