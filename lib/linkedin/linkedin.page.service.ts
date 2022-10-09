import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { Page } from "puppeteer";
import {timer} from "../helpers/timer";

export class LinkedinPageService extends LinkedinAbstractService {
  async elements(page: Page, index: number): Promise<any> {
    if (index === 1) {
      await page.waitForSelector(`.artdeco-card ul li:nth-child(${index})`);
    } else {
      if (!(await page.$(`.artdeco-card ul li:nth-child(${index})`))) {
        return [];
      }
    }

    await this.moveMouseAndScroll(
      page,
      `.artdeco-card ul li:nth-child(${index})`
    );

    const list = await page.evaluate((cur) => {
      const element = document.querySelector(
        `.artdeco-card ul li:nth-child(${cur})`
      );

      if (!element) {
        return undefined;
      }

      const button = element.querySelector("button");
      if (!button || !button?.getAttribute("class")) {
        return [];
      }

      const connect = button.getAttribute("class")?.indexOf("muted") === -1;

      const nameElement =
        element.querySelector(".actor-name") ||
        element.querySelector(".discover-person-card__name") ||
        element.querySelector(
          '.entity-result__title-text [data-control-name="entity_result"]'
        ) ||
        element.querySelector(".entity-result__title-text") ||
        element.querySelector(".artdeco-entity-lockup__title");

      const descriptionElement =
        element.querySelector(".search-result__info > p") ||
        element.querySelector(".discover-person-card__occupation") ||
        element.querySelector(".entity-result__primary-subtitle") ||
        element.querySelector(".artdeco-entity-lockup__subtitle");
      const imgElement =
        element.querySelector("img.discover-entity-type-card__image-circle") ||
        element.querySelector("img");
      // @ts-ignore
      const name = nameElement?.innerText.trim().split("\n")[0];
      const link = element
        ?.querySelector('a[href*="/in/"]')
        ?.getAttribute("href");
      const description = descriptionElement?.textContent?.trim();

      return [
        {
          name,
          link,
          image: imgElement ? imgElement.getAttribute("src") : "",
          description,
          connect,
        },
      ];
    }, index);

    if (!list) {
      return [];
    }

    return [...list, ...(await this.elements(page, index + 1))];
  }

  async pagesTask(page: Page, url: string) {
    const goto = await page.goto(url);

    const json = await page.evaluate((val) => {
      const div = document.createElement("div");
      // @ts-ignore
      div.innerHTML = val;
      // @ts-ignore
      const findElements = Array.from(div.querySelectorAll("code"))?.filter(
        (a) =>
          a?.textContent?.indexOf("elements")! > -1 &&
          a?.textContent?.indexOf("totalResultCount")! > -1
      );
      if (findElements.length === 0) {
        return "{}";
      }

      return findElements[findElements.length - 1]?.textContent?.trim();
    }, (await goto?.buffer())?.toString());

    const { included, data } = JSON.parse(json || "{}");

    if (!data || !included) {
      return {
        pages: 0,
        values: [],
      };
    }

    return {
      pages: Math.ceil(
        (data?.metadata?.totalResultCount > 1000
          ? 1000
          : data?.metadata?.totalResultCount) / 10
      ),
      values:
        included
          ?.filter((f: any) => f?.title?.text)
          ?.map((f: any) => ({
            name: f?.title?.text,
            link: f?.navigationUrl,
            description: f?.primarySubtitle?.text,
            image: f?.image?.attributes[0]?.detailDataUnion
              ?.nonEntityProfilePicture?.vectorImage?.rootUrl
              ? f?.image?.attributes[0].detailDataUnion.nonEntityProfilePicture
                  .vectorImage.rootUrl +
                f?.image?.attributes[0].detailDataUnion.nonEntityProfilePicture
                  .vectorImage.artifacts[0].fileIdentifyingUrlPathSegment
              : "",
          }))
          ?.filter((f: any) => f?.name && f?.link && f?.link.indexOf("/in/") > -1) ||
        [],
    };

    await this.waitForLoader(page);

    await page.waitForSelector(".artdeco-card");
    await page.waitForSelector(
      `.actor-name, .discover-person-card__name, .entity-result__title-text [data-control-name="entity_result"], .entity-result__title-text`,
      {
        timeout: 5000,
      }
    );

    await timer(10000);

    const elements = await this.elements(page, 1);

    await timer(200);

    const deltaY = await page.evaluate(() => {
      return document.body.scrollHeight;
    });

    await page.mouse.wheel({
      deltaY,
    });

    await timer(3000);

    const pages = !elements.length
      ? null
      : await page.evaluate(() => {
          return (
            document
              .querySelector(".artdeco-pagination__pages li:last-child button")
              ?.textContent?.trim() || 1
          );
        });

    return {
      pages: pages === null ? 1 : +pages!,
      values: elements,
    };
  }
}
