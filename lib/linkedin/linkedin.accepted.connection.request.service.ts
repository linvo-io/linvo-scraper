import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { Page } from "puppeteer";
import { LinkedinServicesInterface } from "./linkedin.services.interface";
import {gotoUrl} from "../helpers/gotoUrl";

export class LinkedinAcceptedConnectionsService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<any>
{
  async process(page: Page): Promise<any> {
    gotoUrl(page, "https://www.linkedin.com/mynetwork/invite-connect/connections/");

    await this.waitForLoader(page);

    try {
      await page.waitForSelector(".mn-connection-card__details", {
        timeout: 10000,
      });

      return (await this.scrapeProfile(page)).map((m) => ({
        name: m.name,
        url: m.url,
      }));
    } catch (err) {
      return [];
    }
  }

  async scrapeProfile(
    page: Page
  ): Promise<Array<{ name: string; url: string }>> {
    // @ts-ignore
    return page.evaluate(async (current) => {
      return Array.from(
        document.querySelectorAll("ul .mn-connection-card")
      ).map((elm) => ({
        name: elm
          .querySelector(".mn-connection-card__name")
          ?.textContent?.trim(),
        url: [
          elm.querySelector("a")?.getAttribute("href"),
        ].reduce((all, url) => {
          // @ts-ignore
          if (url[url.length - 1] === "/") {
            // @ts-ignore
            return url.slice(0, -1);
          }
          return url;
        }, ""),
      }));
    });
  }
}
