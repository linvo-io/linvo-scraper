import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { Page } from "puppeteer-core";
import Sentiment from "sentiment";
import { chunk, shuffle } from "lodash";
import { Message } from "./linkedin.message.service";
import { LinkedinServicesInterface } from "./linkedin.services.interface";
import {gotoUrl} from "../helpers/gotoUrl";
import {timer} from "../helpers/timer";
const analyzer = new Sentiment();

export class LinkedinMessagesFromChat
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<any>
{
  async process(page: Page) {
    gotoUrl(page, "https://www.linkedin.com/messaging/");

    await this.waitForLoader(page);

    return this.continueGetAllMessagesFromChat(page);
  }

  async getMessagesList(
    page: Page,
    lastName: string
  ): Promise<{
    id: string;
    name: string;
    time: string;
    img: string;
    link: string;
    values: Message[];
  }> {
    try {
      await page.waitForFunction(
        (last) => {
          return (
            last !==
            document
              ?.querySelector(
                '[data-control-name="topcard"] h2, .msg-entity-lockup__entity-title-wrapper h2'
              )
              ?.textContent?.trim()
          );
        },
        { timeout: 10000 },
        lastName
      );
      await page.waitForSelector(".msg-s-message-list__loader.hidden");
    } catch (err) {
      // @ts-ignore
      return;
    }

    const getName = await page.evaluate(() => {
      return (
        document
          ?.querySelector(
            '[data-control-name="topcard"] h2, .msg-entity-lockup__entity-title-wrapper h2'
          )
          ?.textContent?.trim() || ""
      );
    });

    const time =
      (await page.evaluate((n) => {
        return (Array.from(document.querySelectorAll("h3")) || [])
          ?.find((f) => f?.innerText?.trim()?.indexOf(n) > -1)
          ?.nextElementSibling?.textContent?.trim();
      }, getName)) || "";

    const img =
      (await page.evaluate((n) => {
        return (Array.from(document.querySelectorAll("h3")) || [])
          ?.find((f) => f?.innerText?.trim()?.indexOf(n) > -1)
          ?.closest("li")
          ?.querySelector("img")
          ?.getAttribute("src");
      }, getName)) || '';

    const id = await page.evaluate(() => {
      return document
        ?.querySelector('[data-control-name="topcard"], .msg-thread__link-to-profile')
        ?.getAttribute("href")
        ?.trim();
    });

    const link = await page.evaluate(() => {
      return window.location.href;
    });

    const a = {
      id,
      name: getName,
      time,
      img,
      link,
      values: (
        await page.evaluate((theName) => {
          return (
            Array.from(
              document.querySelectorAll(".msg-s-message-list__event")
            ) || []
          ).reduce((all, current) => {
            const top = current
              .querySelector('[data-control-name="view_profile"], .msg-s-message-group__profile-link')
              ?.textContent?.trim();

            const time = Array.from(current.querySelectorAll("time"))
              ?.find((m) => m?.textContent?.indexOf(":")! > -1)
              ?.textContent?.trim();
            if (top) {
              all.push({
                name: theName!,
                link: window.location.href,
                time,
                from: top === theName ? "Prospect" : "Me",
                message: "",
              });
            }

            const message = current
              .querySelector("[data-event-urn] p")
              ?.textContent?.trim();

            all[all.length - 1] = {
              ...all[all.length - 1],
              message: (" " + message).trim(),
            };

            return all;
          }, [] as any[]);
        }, getName)
      )
        .map((p) => ({
          ...p,
          sentiment: p?.message ? analyzer.analyze(p?.message).score : 0,
        }))
        .filter((p) => p?.message && p?.name),
    };

    console.log(a);

    // @ts-ignore
    return a;
  }

  async nextPerson(
    page: Page,
    idList: string[],
    name: string,
    language: string
  ): Promise<any> {
    if (!idList.length) {
      return [];
    }

    const current = idList.shift();

    await this.moveAndClick(
      page,
      `#${current} .msg-conversation-card__body-row`
    );
    await timer(2000);

    const load = await this.getMessagesList(page, name);
    return [
      ...(load?.id
        ? [
            {
              id: load?.id,
              time: load?.time,
              name: load?.name || "",
              link: load?.link || "",
              list: load?.values,
              img: load?.img || "",
              language,
            },
          ]
        : []),
      ...(await this.nextPerson(page, idList, load?.name || "", language)),
    ];
  }

  async totalVisibleElement(page: Page) {
    return page.evaluate(() => {
      const { height: elmHeight } = document
        .querySelector(
          ".msg-conversations-container__conversations-list > li:not(:empty)"
        )
        ?.getBoundingClientRect()!;
      const { height: heightContainer } = document
        .querySelector(".msg-conversations-container__conversations-list")
        ?.getBoundingClientRect()!;
      return Math.floor(heightContainer / elmHeight);
    });
  }

  async continueGetAllMessagesFromChat(page: Page) {
    await page.waitForSelector(
      ".msg-conversations-container__conversations-list > li:not(:empty)",
      {
        visible: true,
      }
    );
    const visibility = await this.totalVisibleElement(page);
    const all = shuffle(
      (
        await page.evaluate((vis) => {
          return Array.from(
            document.querySelectorAll(
              ".msg-conversations-container__conversations-list > li:not(:empty):not(.msg-conversation-card--occluded)"
            )
          )
            .map((f) => ({
              id: f.getAttribute("id"),
              filter:
                f.innerHTML.indexOf("InMail") > -1 ||
                f.innerHTML.indexOf("LinkedIn Offer") > -1 ||
                f.innerHTML.indexOf("Sponsored") > -1,
            }))
            .filter((f) => (f.id || "").indexOf("ember") > -1)
            .slice(0, vis);
        }, visibility)
      )
        .filter((f) => !f.filter)
        .map((p) => p.id)
    );

    const language = await page.evaluate(() => {
      return document
        .querySelector('meta[name="i18nLocale"]')
        ?.getAttribute("content")
        ?.split("_")[0];
    });

    return (await this.nextPerson(page, all as any, "", language!)).filter(
      (f: any) => f?.name && f?.list.length
    );
  }
}
