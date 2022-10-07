import { LinkedinAbstractService } from "./linkedin.abstract.service";
import {
  CombinedData,
  LinkedinServicesInterface,
} from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
import { LinkedinMessageService } from "./linkedin.message.service";
import {createLinkedinLink} from "../helpers/create.linkedin.url";
import {gotoUrl} from "../helpers/gotoUrl";
import {timer} from "../helpers/timer";
import {LinkedinErrors} from "../enums/linkedin.errors";

interface RequiredData {
  url: string;
  message: string;
  contact: any;
  IgnoreProspectMessages: 1 | 2 | 0;
  extra: {
    myname: string;
    mylastname: string;
    mycompany: string;
  };
  image?: {
    todo: "gif" | "upload" | "personalized";
    value: {
      picture: string;
      id: string | number;
    };
  };
}

export class LinkedinMessageWithView
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData>
{
  async process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>) {
    const theUrl = createLinkedinLink(data.url, true);

    gotoUrl(page, theUrl);

    await this.waitForLoader(page);

    await page.waitForSelector(".pv-top-card--list > li, .pv-top-card__photo");
    await timer(3000);
    const info = await this.extractInformation(page);

    const newMessage = await this.generateMessage(data.message, {
      firstName: info.name,
      lastName: info.last_name,
      companyName: info.companyName,
      profilePicture: info.profilePicture,
      ...data.extra,
    });

    const url = await page.evaluate(() => {
      return Array.from(document.body.querySelectorAll("*"))
        ?.find(
          (p) => p?.getAttribute("href")?.indexOf("/messaging/thread")! > -1
        )
        ?.getAttribute("href");
    });

    if (!url) {
      throw new LinkedinErrors("You are not connected with the prospect");
    }

    const messageService = new LinkedinMessageService();
    return messageService.process(page, cdp, {
      ...data,
      url,
      info: {
        currentCompanyPicture: info.currentCompanyPicture,
        companyName: info.companyName,
        current_position_title: info.currentTitle,
        location: info.location,
        headline: info.headline,
        current_position_length: info.currentPositionLength,
        name: data?.contact?.name || info.name + " " + info.last_name,
        url: theUrl,
      },
      name: data?.contact?.name || info.name + " " + info.last_name,
      message: newMessage,
    });
  }
}
