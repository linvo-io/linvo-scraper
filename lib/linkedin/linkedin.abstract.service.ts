import { Page } from "puppeteer";
import {MessagesService} from "../helpers/messages.service";
import {randomIntFromInterval, timer} from "../helpers/timer";
import {LINKEDIN_ERRORS, LinkedinErrors} from "../enums/linkedin.errors";
import {capitalize} from "../helpers/capitalize";

export class LinkedinAbstractService extends MessagesService
{
  async extractEmail(page: Page) {
    await page.waitForSelector(".artdeco-modal", {
      visible: true,
    });

    await timer(10000);

    const email = await page.evaluate(() => {
      const modalText = document
        ?.querySelector(".artdeco-modal")
        ?.textContent?.trim();
      return modalText?.match(
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
      );
    });

    const phone = await page.evaluate(() => {
      return Array.from(
        (
          document
            .querySelector('.artdeco-modal [type="phone-handset-icon"]')
            ?.closest("section") || document.querySelector(".ci-phone")
        )?.querySelectorAll("li") || []
      )
        ?.map((curr) => {
          const [phone, type] = Array.from(curr?.querySelectorAll("span"));
          return {
            phone: phone?.innerText?.trim(),
            type: type?.innerText?.trim().replace(/\)|\(/g, ""),
          };
        })
        .filter((f) => f?.phone && f?.type);
    }, []);

    const im = await page.evaluate(() => {
      return Array.from(
        (
          document
            .querySelector('.artdeco-modal [type="speech-bubble-icon"]')
            ?.closest("section") || document.querySelector(".ci-ims")
        )?.querySelectorAll("li") || []
      )
        ?.map((curr) => {
          const [phone, type] = Array.from(curr?.querySelectorAll("span"));
          return {
            link: phone?.innerText?.trim(),
            type: type?.innerText?.trim().replace(/\)|\(/g, ""),
          };
        })
        .filter((f) => f?.link && f?.type);
    }, []);

    const websites = await page.evaluate(() => {
      return Array.from(
        (
          document
            .querySelector('.artdeco-modal [type="link-icon"]')
            ?.closest("section") || document.querySelector(".ci-websites")
        )?.querySelectorAll("li") || []
      )
        ?.map((curr) => {
          const [website, type] = [
            curr.querySelector("a"),
            curr.querySelector("span"),
          ];
          return {
            link: website?.getAttribute("href")?.trim(),
            type: type?.innerText?.trim().replace(/\)|\(/g, ""),
          };
        })
        ?.filter((f) => f?.link && f?.type);
    }, []);

    const birthDay = await page.evaluate(() => {
      return (
        (
          document
            .querySelector('.artdeco-modal [type="cake-icon"]')
            ?.closest("section") || document.querySelector(".ci-birthday")
        )
          ?.querySelector("span")
          ?.innerText?.trim() || ""
      );
    }, []);

    const twitter = await page.evaluate(() => {
      return (
        (
          document
            .querySelector('.artdeco-modal [type="twitter-icon"]')
            ?.closest("section") || document.querySelector(".ci-twitter")
        )
          ?.querySelector("a")
          ?.getAttribute("href") || ""
      );
    }, []);

    return {
      ...(email?.length ? { email: email[0] } : {}),
      ...(phone?.length ? { phone } : {}),
      ...(websites?.length ? { websites } : {}),
      ...(twitter?.length ? { twitter } : {}),
      ...(im?.length ? { im } : {}),
      ...(birthDay?.length ? { birthDay } : {}),
    };
  }

  async moveMouseAndScroll(
    page: Page,
    selector: string,
    timeout?: number,
    disabledMouseMove?: boolean,
    offset = 0
  ) {
    await page.waitForSelector(selector, { visible: true, timeout });
    // @ts-ignore
    const cur = page.cursor as GhostCursor;
    // @ts-ignore

    const pos = await page.evaluate((elm) => {
      // @ts-ignore
      const { top, y, height } = document
        ?.querySelector(elm)
        ?.getBoundingClientRect();
      return { top, y, height };
    }, selector);

    try {
      await cur.moveTo({
        y: pos.y + pos.height + offset,
        x: randomIntFromInterval(300, 1000),
      });

      await page.mouse.wheel({
        deltaY: pos.top + offset,
      });
    } catch (err) {}

    await timer(300);

    if (!disabledMouseMove) {
      try {
        await cur.move(selector, {
          moveDelay: 300,
          paddingPercentage: 30,
          waitForSelector: 200,
        });
      } catch (err) {}
    }

    await timer(1000);
  }

  static async checkLimit(page: Page) {
    const options = [
      {
        char: "You’ve reached the weekly invitation limit",
        message: "You’ve reached the weekly invitation limit",
        delay: 1440,
        type: "Connect",
      },
      {
        char: "Too Many Requests",
        message: "Too Many Search Requests",
        delay: 120,
        type: "Connect",
      },
      {
        char: "You’re out of invitations for now",
        message: "You’re out of invitations for now",
        delay: 1440,
        type: "Connect",
      },
      {
        char: "Drive more leads and bigger deals with Sales Navigator",
        message: "User doesn't have Linkedin sales nav",
        delay: 1440,
        type: "Connect",
      },
      {
        char: "reached the weekly invitation limit",
        message: "You’ve reached the weekly invitation limit",
        delay: 1440,
        type: "Connect",
      },
      {
        char: "Search limit reached",
        message: "Search limit reached",
        delay: 120,
        type: "Page",
      },
      {
        char: "quick security check",
        message: "Verification Screen",
        delay: 120,
        type: "All",
      },
      {
        char: "we have restricted your account until",
        message: "Account Restricted until some date",
        delay: 100000000,
        type: "restrictions",
      },
      {
        char: "Your account has been restricted",
        message: "Account Restricted",
        delay: 100000000,
        type: "restrictions",
      },
      {
        char: "unusual activity from your account",
        message: "Unusual activity from account",
        delay: 100000000,
        type: "restrictions",
      },
    ];

    const isLimitedReached = (
      await page.evaluate((optionList) => {
        const body = document.querySelector("body")?.textContent?.trim();
        return optionList.map((option) => ({
          ...option,
          char: body?.indexOf(option.char),
        }));
      }, options)
    ).filter((f) => f.char && f.char !== -1);

    if (isLimitedReached.length) {
      throw new LinkedinErrors(
        `We have postpone your account activity, We got from Linkedin ${isLimitedReached[0].message}`,
        undefined,
        { values: LINKEDIN_ERRORS.DELAY, more: isLimitedReached[0].delay }
      );
    }
  }

  static async checkToken(page: Page) {
    const cookies = await page.cookies('https://www.linkedin.com');
    if (cookies?.length && !cookies?.some(c => c.name === 'li_at')) {
      throw new LinkedinErrors("Your user have been disconnected", undefined, {
        values: LINKEDIN_ERRORS.DISCONNECTED,
      });
    }
  }

  async extractInformation(page: Page): Promise<{
    currentTitle: string;
    currentPositionLength: string;
    headline: string;
    location: string;
    profilePicture: string;
    name: string;
    last_name: string;
    companyName: string;
    currentCompanyPicture: string;
  }> {
    await page.mouse.wheel({
      deltaY: 200,
    });

    await page.mouse.wheel({
      deltaY: 200,
    });

    await page.mouse.wheel({
      deltaY: 200,
    });

    await page.mouse.wheel({
      deltaY: 200,
    });
    const info = await page.evaluate(() => {
      const profilePicture = document
        .querySelector(".pv-top-card__photo")
        ?.getAttribute("src");
      const name = (
        document?.querySelector(".text-heading-xlarge") ||
        document?.querySelector(".pv-top-card--list > li") || {
          textContent: "",
        }
      )?.textContent
        ?.trim()
        ?.split(" ");
      const companyName = (
        document.querySelector(".pv-text-details__right-panel h2") ||
        document.querySelector(".pv-top-card--experience-list-item") || {
          textContent: "",
        }
      )?.textContent?.trim();
      const locationNew = (
        document.querySelector(".artdeco-card .pb2 > span") ||
        document.querySelector(".pv3 > span") ||
        document.querySelector(".pv-top-card h2 + ul > li")
      )?.textContent?.trim();
      const headline = (
        document.querySelector(".text-body-medium") ||
        document.querySelector(".pv-top-card h2")
      )?.textContent?.trim();

      const currentCompanyPicture = document
        .querySelector(".pv-position-entity img")
        ?.getAttribute("src");
      const currentPositionLength =
        document
          .querySelector(
            ".pv-entity__company-details .t-normal > span:last-child"
          )
          ?.textContent?.trim() ||
        document
          .querySelector(".pv-entity__date-range + h4 > span:last-child")
          ?.textContent?.trim();

      const currentTitle =
        document
          .querySelector(
            ".pv-profile-section__section-info > li:first-child .pv-entity__role-details-container--timeline h3 > span:last-child"
          )
          ?.textContent?.trim() ||
        document
          .querySelector(
            ".pv-profile-section__section-info > li:first-child h3"
          )
          ?.textContent?.trim();
      return {
        currentCompanyPicture,
        currentTitle,
        currentPositionLength,
        headline,
        location: locationNew,
        profilePicture,
        name: name?.length ? name[0] : '',
        last_name: name?.length ? name[1] : '',
        companyName,
      };
    });

    await page.mouse.wheel({
      deltaY: -200,
    });

    await page.mouse.wheel({
      deltaY: -200,
    });

    await page.mouse.wheel({
      deltaY: -200,
    });

    await page.mouse.wheel({
      deltaY: -200,
    });

    await timer(3000);

    // @ts-ignore
    return info;
  }

  async moveAndClick(
    page: Page,
    select: string | { container: string; selector: string },
    timeout?: number,
    totalClicks?: number
  ) {
    const selector = typeof select === "string" ? select : select.selector;
    const offset =
      typeof select === "string"
        ? 0
        : await page.evaluate((el) => {
            // @ts-ignore
            return document.querySelector(el)?.offsetTop || 0;
          }, select.container);
    const gotSelector = "[Got Selector]".cyan() + " " + selector.blue();

    await page.waitForSelector(selector, { visible: true, timeout });
    await timer(randomIntFromInterval(200, 444));

    const elm = await page.$(selector);
    if (elm) {
      const pos = await elm.boundingBox();
      // @ts-ignore
      const cur = page.cursor as GhostCursor;

      try {
        await cur.moveTo({
          // @ts-ignore
          x: pos.x + pos.width / 2,
          // @ts-ignore
          y: pos.y - offset + pos.height / 2,
        });
      } catch (err) {
        try {
          await cur.move(gotSelector);
        } catch (err) {}
      }

      try {
        await page.mouse.click(
            // @ts-ignore
        pos.x + pos.width / 2,
            // @ts-ignore
        pos.y - offset + pos.height / 2,
            {
              clickCount: totalClicks
            }
        );
      } catch (err) {
        try {
          await page.click(selector, {
            clickCount: totalClicks
          });
        } catch (err) {}
      }

      return elm;
    }

    return page.evaluate((elm) => {
      // @ts-ignore
      document.querySelector(elm).click();
    }, selector);
  }

  generateMessage(
    message: string,
    params: {
      firstName: string;
      lastName: string;
      companyName: string;
      profilePicture: string;
      myname: string;
      mylastname: string;
      mycompany: string;
    }
  ) {
    return this.createMessage(message, [
      { label: "name", value: capitalize(params.firstName) },
      { label: "last_name", value: capitalize(params.lastName) },
      { label: "lastname", value: capitalize(params.lastName) },
      { label: "myname", value: capitalize(params.myname) },
      { label: "mylastname", value: capitalize(params.mylastname) },
      { label: "mycompany", value: capitalize(params.mycompany) },
      { label: "company", value: params.companyName },
    ]);
  }

  async waitForLoader(page: Page) {
    try {
      await page.waitForSelector(".initial-load-animation:not(.fade-load)", {
        visible: true,
        timeout: 10000,
      });

      await page.waitForSelector(".initial-load-animation.fade-load", {
        timeout: 0,
      });
    } catch (err) {}
    await timer(3000);
  }

  async selectContract(page: Page) {
    try {
      await page.waitForSelector(".contract-list .action-select-contract", {
        timeout: 0,
      });

      await this.moveAndClick(
        page,
        ".contract-list .action-select-contract",
        0
      );
    } catch (err) {}
  }

  async waitForSalesLoader(page: Page) {
    // this.selectContract(page);

    await page.waitForSelector(".initial-load-animation:not(.fade-load)", {
      visible: true,
      timeout: 60000,
    });

    await page.waitForSelector(".initial-loading-state.hide-loading", {
      timeout: 300000,
    });

    await timer(3000);
  }
}
