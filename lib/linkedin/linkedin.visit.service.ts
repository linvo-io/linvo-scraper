import { LinkedinAbstractService } from './linkedin.abstract.service';
import { LinkedinServicesInterface } from './linkedin.services.interface';
import { CDPSession, Page } from 'puppeteer';
import {gotoUrl} from "../helpers/gotoUrl";
import {timer} from "../helpers/timer";
import {createLinkedinLink} from "../helpers/create.linkedin.url";

interface RequiredData {
  url: string;
}

export class LinkedinVisitService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData> {
  async process(page: Page, cdp: CDPSession, data: RequiredData) {
    const { url } = data;
    const theUrl =
      url.indexOf("linkedin.com") !== -1
        ? url
        : `https://www.linkedin.com${data.url}`;

    gotoUrl(page, theUrl);

    await this.waitForLoader(page);

    await page.waitForSelector(".pv-top-card--list > li, .pv-top-card__photo");
    await timer(3000);
    // this is super important, if we don't do this, we would not know about the new url
    // And we will not know about connection requests approved
    const newUrl = await page.evaluate(() => {
      return window.location.href;
    });

    return {url: theUrl, linkedin_id: createLinkedinLink(newUrl, false)};
  }
}
