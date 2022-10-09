import { LinkedinAbstractService } from './linkedin.abstract.service';
import { LinkedinServicesInterface } from './linkedin.services.interface';
import { CDPSession, Page } from 'puppeteer';
import {createLinkedinLink} from "../helpers/create.linkedin.url";
import {gotoUrl} from "../helpers/gotoUrl";
import {timer} from "../helpers/timer";

interface RequiredData {
  url: string;
}

export class LinkedinEmailService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData> {

  async process(page: Page, cdp: CDPSession, data: RequiredData) {
    const { url } = data;
    const theUrl = createLinkedinLink(url, true);

    try {
      gotoUrl(page, theUrl);

      await this.waitForLoader(page);

      await timer(3000);
      // this is super important, if we don't do this, we would not know about the new url
      // And we will not know about connection requests approved
      const newUrl = await page.evaluate(() => {
        return window.location.href;
      });

      await page.evaluate(() => {
        history.pushState({}, '', window.location.href + 'overlay/contact-info/');
        history.pushState({}, '', window.location.href + 'overlay/contact-info/');
        history.back();
      });

      return {...await this.extractEmail(page), url: theUrl, linkedin_id: createLinkedinLink(newUrl, false)};
    }
    catch (err) {
      const newUrl = await page.evaluate(() => {
        return window.location.href;
      });

      return {url: theUrl, linkedin_id: createLinkedinLink(newUrl, false)};
    }
  }
}
