import { Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
import {timer} from "../helpers/timer";

export class LinkedinSalesPageService extends LinkedinAbstractService {
  globalError() {
    return {
      text: "Could not scrape pages",
    };
  }

  async salesNavChooser(page: Page) {
    try {
      await page.waitForSelector(".action-select-contract", {
        visible: true
      });
      await page.click(".action-select-contract");
    } catch (err) {}
  }

  async pagesTask(page: Page, url: string) {
    await page.goto("https://www.linkedin.com/sales/index", {
      waitUntil: "networkidle2",
    });

    await page.waitForFunction(() => {
      return (
        window.location.href.indexOf("https://www.linkedin.com/sales/home") > -1
      );
    });

    await page.waitForSelector(".logo-text", {
      visible: true,
    });

    page.goto(url);
    this.salesNavChooser(page);

    const res = await page.waitForResponse(
      async (p) => {
        try {
          const text = await p.text();
          return (
              (p.headers()["content-type"] === "application/json" &&
                  text.indexOf("firstName") > -1 &&
                  text.indexOf("elements") > -1) ||
              (p.headers()["content-type"] === "text/html" &&
                  text.split("<code").some((f) => {
                    return (
                        f.indexOf("firstName") > -1 &&
                        f.indexOf("elements") > -1 &&
                        f.indexOf("premium") > -1 &&
                        f.indexOf("degree") > -1 &&
                        f.indexOf("summary") > -1 &&
                        f.indexOf("entityUrn") > -1
                    );
                  }))
          );
        }
        catch (err) {
          return false;
        }
      },
      {
        timeout: 0,
      }
    );

    const txt = (await res.text()).toString();
    const json =
      res.headers()["content-type"] === "application/json"
        ? await res.json()
        : await page.evaluate((val) => {
            const div = document.createElement("div");
            div.innerHTML = val;
            // @ts-ignore
            const findElements = Array.from(
              div.querySelectorAll("code")
            )?.filter(
              (a) =>
                a?.textContent?.indexOf("elements")! > -1 &&
                a?.textContent?.indexOf("firstName")! > -1
            );
            if (findElements.length === 0) {
              return "{}";
            }

            return JSON.parse(
              findElements[findElements.length - 1]?.textContent?.trim()!
            );
          }, txt);

    const { paging, elements } = json;

    return {
      pages: paging?.total
        ? Math.ceil((paging.total > 2500 ? 2500 : paging.total) / 25)
        : 0,
      values:
        elements
          ?.filter((f: any) => {
            return (
              f?.firstName && f?.entityUrn?.indexOf("fs_salesProfile") > -1
            );
          })
          ?.map((e: any) => ({
            premium: e?.premium,
            connected: e?.degree === 1,
            link: [e?.entityUrn?.split("(")[1]?.split(",")[0]?.trim()]
              ?.filter((f) => f)
              ?.map((f) => "https://www.linkedin.com/in/" + f)
              ?.find((a) => a),
            name: e.firstName + " " + e.lastName,
            image: e?.profilePictureDisplayImage?.artifacts?.length
              ? e?.profilePictureDisplayImage.rootUrl +
                e?.profilePictureDisplayImage?.artifacts[0]
                  ?.fileIdentifyingUrlPathSegment
              : "",
            description: e?.summary || "",
          }))
          ?.filter((f: any) => f?.link && f?.name) || [],
    };

    const val = await Promise.race([
      new Promise(async (res) => {
        try {
          await page.waitForSelector(".search-results__no-results-message", {
            timeout: 80000,
          });

          return 1;
        } catch (err) {}

        res(1);
      }),
      new Promise(async (res) => {
        try {
          await page.waitForSelector(".mt4[data-scroll-into-view]", {
            timeout: 80000,
          });
        } catch (err) {}

        res(2);
      }),
      new Promise(async (res) => {
        try {
          await page.waitForSelector("[data-scroll-into-view] dt", {
            timeout: 80000,
          });
        } catch (err) {}

        res(3);
      }),
    ]);

    if (val === 1) {
      return {
        values: [],
        pages: 0,
      };
    }

    await timer(10000);

    for (let i = 1; i <= 7; i++) {
      await page.mouse.wheel({
        deltaY: 400,
      });

      await timer(2000);
    }

    const values = await this.workOnResults(page);
    const deltaY = await page.evaluate(() => {
      return (
        document.documentElement.scrollHeight -
          document.documentElement.scrollTop -
          document.documentElement.clientHeight || 1
      );
    });

    await page.mouse.wheel({
      deltaY,
    });

    await timer(5000);

    const pages = values.length
      ? await page.evaluate(
          () =>
            document
              .querySelector(
                ".search-results__pagination-list li:last-child button, .artdeco-pagination__pages li:last-child button"
              )
              ?.textContent?.trim() || 1
        )
      : null;

    return {
      values,
      pages: pages === null ? null : +pages!,
    };
  }

  async scrollTo(page: Page, scrollName: string, time = 0): Promise<any> {
    if (time === 5) {
      return false;
    }

    const findIt = await page.evaluate((name) => {
      return !!document.querySelector(
        `[data-scroll-into-view="${name}"] dt, [id="${name}"]`
      )?.textContent;
    }, scrollName);

    if (!findIt) {
      await this.moveMouseAndScroll(
        page,
        `[data-scroll-into-view="${scrollName}"], [id="${scrollName}"]`
      );
      await timer(1000);
      return this.scrollTo(page, scrollName, time + 1);
    }

    return true;
  }

  async workOnResults(page: Page) {
    const allAttributes = await page.evaluate(() => {
      const l = Array.from(
        document.querySelectorAll(".search-results__result-item")
      ).map((p) => p.getAttribute("data-scroll-into-view"));

      if (l.length > 0) {
        return l;
      }
      return Array.from(
        document.querySelectorAll(".artdeco-entity-lockup")
      ).map((p) => p.getAttribute("id"));
    });

    const arr = [];
    for (const scrollInto of allAttributes) {
      const find = await this.scrollTo(page, scrollInto!);
      if (!find) {
        continue;
      }

      const info = await page.evaluate((val) => {
        const selector = document.querySelector(
          `[data-scroll-into-view="${val}"], [id="${val}"]`
        );
        const href = [
          ...Array.from(selector?.querySelectorAll('a[href*="/sales/"]')!),
        ].find((f) => f.children.length === 0);

        return {
          name: href?.textContent?.trim(),
          link: href
            ?.getAttribute("href")
            ?.trim()
            ?.split(",")[0]
            .replace("/sales/people/", "/in/"),
          image: selector?.querySelector("img")?.getAttribute("src"),
          description:
            selector
              ?.querySelector(".result-lockup__highlight-keyword")
              // @ts-ignore
              ?.innerText?.trim()
              ?.split("\n")[0] || "",
        };
      }, scrollInto);

      arr.push(info);
    }

    return arr.filter((f) => f.name && f.link);
  }
}
