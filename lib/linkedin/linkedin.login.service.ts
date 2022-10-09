import {
  LinkedinServicesInterface,
} from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
import {timer} from "../helpers/timer";
import {LINKEDIN_ERRORS, LinkedinErrors} from "../enums/linkedin.errors";

interface RequiredData {
  user: string;
  password: string;
}

export class LinkedinLoginService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData>
{
  async process(page: Page, cdp: CDPSession, data: RequiredData) {
    try {
      await page.goto("https://www.linkedin.com/login");

      await page.waitForSelector("#username");

      await timer(4000);

      await (await page.$("#username"))?.type(data.user, { delay: 30 });

      await timer(500);

      await (await page.$("#password"))?.type(data.password, { delay: 30 });

      await timer(1000);
      await (await page.$("button[type=submit]"))?.click();

      await timer(3000);

      await page.waitForSelector(".search-global-typeahead__input", {
        timeout: 30000,
      });

      const token = await page.cookies();

      return {
        user: data.user,
        token: token?.find((t) => t.name === "li_at")?.value,
      };
    } catch (err) {
      throw new LinkedinErrors(
        "Could not login to linkedin, please update you credentials",
        '/accounts',
        {
          values: LINKEDIN_ERRORS.INVALID_CREDENTIALS,
        }
      );
    }
  }
}
