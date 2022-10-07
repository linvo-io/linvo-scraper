import {
  CombinedData,
  LinkedinServicesInterface,
} from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { findBestMatch } from "string-similarity";
import Sentiment from "sentiment";
import moment from "moment";
import {gotoUrl} from "../helpers/gotoUrl";
import {timer} from "../helpers/timer";
import {LinkedinErrors} from "../enums/linkedin.errors";
const analyzer = new Sentiment();

interface RequiredData {
  name: string;
  info?: any;
  contact?: any;
  message: string;
  url: string;
  IgnoreProspectMessages: 0 | 1 | 2;
  image?: {
    todo: "gif" | "upload" | "personalized";
    value: {
      picture: string;
      id: string | number;
    };
  };
}

export interface Message {
  from: "Prospect" | "Me";
  message: string;
  sentiment: number;
}

export class LinkedinMessageService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData>
{
  async findInChat(page: Page, name: string) {
    return page.evaluate((name) => {
      return Array.from(document.querySelectorAll("h3"))
        .find((f) => {
          return (
            name.indexOf(f.innerText.trim()) > -1 ||
            f.innerText.trim().indexOf(name) > -1
          );
        })
        ?.closest("li")
        ?.getAttribute("id");
    }, name);
  }

  async process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>) {
    gotoUrl(
      page,
      data.url
        ? data.url.indexOf("linkedin.com") > -1
          ? data.url
          : "https://www.linkedin.com" + data.url
        : "https://www.linkedin.com/messaging/"
    );

    await this.waitForLoader(page);

    const {
      name,
      IgnoreProspectMessages,
      message,
      image,
      info,
      contact,
      account,
    } = data;

    if (!data.url) {
      await page.waitForSelector('[type="search-icon"] svg');
      await page.evaluate(() => {
        return document.querySelectorAll(
          ".msg-conversations-container__conversations-list .msg-conversation-listitem"
        ).length;
      });

      await page.waitForSelector('input[name="searchTerm"]');

      const findMessage = await this.findInChat(page, name);

      if (!findMessage) {
        await this.moveAndClick(page, 'input[name="searchTerm"]');
        await page.type('input[name="searchTerm"]', name, {
          delay: 10,
        });

        await page.keyboard.press("Enter");
      }

      await page.waitForFunction(
        (name) => {
          return Array.from(document.querySelectorAll("h3")).some((f) => {
            return (
              name.indexOf(f.innerText.trim()) > -1 ||
              f.innerText.trim().indexOf(name) > -1
            );
          });
        },
        {},
        name
      );

      await timer(5000);

      const findHandle = await this.findInChat(page, name);

      if (!findHandle) {
        throw new LinkedinErrors("Could not find message in the chat");
      }

      await page.evaluate((m) => {
        // @ts-ignore
        return document.querySelector(`${m} a`)?.click();
      }, `#${findHandle}`);

      await timer(10000);
    }

    await page.waitForSelector('[contenteditable="true"]');

    await timer(5000);

    const list = await this.getMessagesList(page, "");

    const onlyMyMessages = list.values.filter((f) => f.from === "Me");

    const messageRanking =
      onlyMyMessages.length === 0
        ? 0
        : findBestMatch(
            message,
            onlyMyMessages.map((f) => f.message)
          ).bestMatch.rating;

    if (
      !(
        (IgnoreProspectMessages === 2 &&
          list.values.some((f) => f.from === "Prospect")) ||
        (IgnoreProspectMessages === 1 &&
          !list.values.some((f) => f.from === "Prospect")) ||
        IgnoreProspectMessages === 0
      )
    ) {
      throw new LinkedinErrors("Prospect Already Replied");
    }

    if (
      onlyMyMessages.some((f) => f.message.indexOf(message) > -1) ||
      messageRanking > 0.9
    ) {
      throw new LinkedinErrors("Duplicate Message Avoided");
    }

    await this.moveAndClick(page, '[contenteditable="true"]', undefined, 3);
    await timer(2000);
    await page.evaluate((wText) => {
      document.execCommand("selectAll", false, undefined);
      document.execCommand("insertText", false, wText);
    }, message);

    await timer(2000);

    await page.waitForFunction(() => {
      return document.querySelector(
        ".msg-form__send-button:not(:disabled), .msg-form__hint-text"
      );
    });

    const totalBefore = await page.evaluate(() => {
      return document.querySelectorAll(".msg-s-message-list__event").length;
    });

    const type = await page.evaluate(() => {
      return document
        .querySelector(
          ".msg-form__send-button:not(:disabled), .msg-form__hint-text"
        )
        ?.tagName.toLowerCase();
    });

    if (type === "button") {
      await this.moveAndClick(
        page,
        ".msg-form__send-button:not(:disabled), .msg-form__hint-text"
      );
    }
    else {
      await page.keyboard.press('Enter');
    }

    await page.waitForFunction(
      (before) => {
        return (
          document.querySelectorAll(".msg-s-message-list__event").length !==
          before
        );
      },
      {},
      totalBefore
    );

    return {
      info: { ...data.info, name },
      messages: await this.getMessagesList(page, ""),
      name: await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll(
            ".msg-conversation-listitem__participant-names"
          )
        ).map((p) => p?.textContent?.trim());
      }),
    };
  }

  async getMessagesList(
    page: Page,
    lastName: string
  ): Promise<{ name: string; time: string; values: Message[] }> {
    try {
      await page.waitForFunction(
        (last) => {
          return (
            last !==
            document
              ?.querySelector('[data-control-name="topcard"] h2, .msg-thread__link-to-profile h2')
              ?.textContent?.trim()
          );
        },
        { timeout: 10000 },
        lastName
      );
    } catch (err) {
      return {
        time: "none",
        name: "none",
        values: [],
      };
    }

    await page.waitForSelector(".msg-s-message-list__loader.hidden");

    const getName = await page.evaluate(() => {
      return document
        ?.querySelector('[data-control-name="topcard"] h2, .msg-thread__link-to-profile h2')
        ?.textContent?.trim();
    });

    return {
      name: getName!,
      time: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
      values: (
        await page.evaluate((theName) => {
          return Array.from(
            document.querySelectorAll(".msg-s-message-list__event")
          ).reduce((all, current) => {
            const top = current
              .querySelector('[data-control-name="view_profile"], .msg-s-message-group__name,  .msg-s-message-group__profile-link')
              ?.textContent?.trim();
            if (top) {
              all.push({
                name: theName,
                link: window?.location?.href!,
                from: top === theName ? "Prospect" : "Me",
                message: "",
              });
            }

            const message = current
              .querySelector("[data-event-urn] p")
              ?.textContent?.trim();
            if (message) {
              all[all.length - 1].message += " " + message;
              all[all.length - 1].message = all[all.length - 1].message.trim();
            }

            return all;
          }, [] as any[]);
        }, getName)
      ).map((p) => ({
        ...p,
        sentiment: analyzer.analyze(p.message).score,
      })),
    };
  }
}
