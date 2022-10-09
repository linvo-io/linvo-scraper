import {
  LinkedinServicesInterface,
} from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
import {createLinkedinLink} from "../helpers/create.linkedin.url";
import {gotoUrl} from "../helpers/gotoUrl";
import {timer} from "../helpers/timer";
import {LinkedinErrors} from "../enums/linkedin.errors";

interface RequiredData {
  message: string;
  url: string;
  extra?: {
    myname: string;
    mylastname: string;
    mycompany: string;
  };
}

export class LinkedinConnectService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData>
{
  async process(page: Page, cdp: CDPSession, data: RequiredData) {
    const { message, url } = data;
    const theUrl = createLinkedinLink(url, true);

    gotoUrl(page, theUrl);

    await this.waitForLoader(page);

    await page.waitForSelector(".pv-top-card--list > li, .pv-top-card__photo");
    await timer(3000);

    const pending = await page.$(
      "button.pv-s-profile-actions--connect:disabled, .message-anywhere-button.artdeco-button--primary"
    );

    const pending2 = await page.evaluate(() => {
      return !!Array.from(document.querySelectorAll("button")).find(
        (p) =>
          p?.textContent?.toLowerCase()?.trim()?.indexOf("pending")! > -1 ||
          p?.textContent?.toLowerCase()?.trim()?.indexOf("en attente")! > -1 ||
          p?.textContent?.toLowerCase()?.trim()?.indexOf("待處理")! > -1 ||
          p?.textContent?.toLowerCase()?.trim()?.indexOf("ausstehend")! > -1 ||
          p?.textContent?.toLowerCase()?.trim()?.indexOf("nawiąż kontakt")! >
            -1 ||
          p?.textContent?.toLowerCase()?.trim()?.indexOf("in sospeso")! > -1
      );
    });

    if (pending || pending2) {
      throw new LinkedinErrors("Connection is already pending");
    }

    const info = await this.extractInformation(page);

    await this.clickConnectButton(page);

    await timer(3000);

    const email = await page.$("#email");
    if (email) {
      throw new LinkedinErrors("Linkedin Prompt Email Verification");
    }

    try {
      await page.waitForSelector('.artdeco-pill-choice-group button', {
        visible: true,
        timeout: 3000
      });
      await this.moveAndClick(page, '.artdeco-pill-choice-group button:nth-child(1)');
      await timer(500);
      await this.moveAndClick(
          page,
          ".artdeco-modal__actionbar > button:nth-child(1)"
      );
      await timer(500);
    }
    catch (err) {}

    if (message) {
      await page.waitForSelector(".artdeco-modal", {
        visible: true,
      });
      await page.waitForSelector(
        ".artdeco-modal__actionbar > button:nth-child(1)"
      );

      const total = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll(".artdeco-modal__actionbar > button")
        ).length;
      });

      if (total === 3) {
        await this.moveAndClick(
          page,
          ".artdeco-modal__actionbar > button:nth-child(1)"
        );
        await timer(500);
      }

      await this.moveAndClick(
        page,
        ".artdeco-modal__actionbar > button:nth-child(1)"
      );

      try {
        await page.waitForSelector("textarea", {
          timeout: 2000,
        });
      } catch (err) {
        await page.evaluate(() => {
          document
            .querySelector(".artdeco-modal__actionbar > button:nth-child(1)")
            // @ts-ignore
            ?.click();
        });

        await page.waitForSelector("textarea");
      }

      const textArea = await this.moveAndClick(page, "textarea");

      const newMessage = await this.generateMessage(message, {
        firstName: info.name,
        lastName: info.last_name,
        companyName: info.companyName,
        profilePicture: info.profilePicture,
        ...data.extra,
      });

      // @ts-ignore
      await textArea.type(newMessage, {
        delay: 30,
      });

      await page.waitForFunction(() => {
        const find = document.querySelector(
          ".artdeco-modal__actionbar > button:nth-child(2)"
        );
        return (
          find &&
          find?.getAttribute("class")?.indexOf("artdeco-button--disabled") === -1
        );
      });
    }

    await this.moveAndClick(
      page,
      ".artdeco-modal__actionbar > button:nth-child(2)"
    );

    try {
      await page.waitForFunction(
        () => {
          return !document.querySelector(
            ".artdeco-modal__actionbar > button:nth-child(2)"
          );
        },
        {
          timeout: 1000,
        }
      );
    } catch (err) {}

    // this is super important, if we don't do this, we would not know about the new url
    // And we will not know about connection requests approved
    const newUrl = await page.evaluate(() => {
      return window.location.href;
    });

    return {
      name: info.name + " " + info.last_name,
      currentCompanyPicture: info.currentCompanyPicture,
      companyName: info.companyName,
      current_position_title: info.currentTitle,
      location: info.location,
      headline: info.headline,
      current_position_length: info.currentPositionLength,
      url: theUrl,
      linkedin_id: createLinkedinLink(newUrl, false),
    };
  }

  async connectMethod3(page: Page) {
    await this.moveAndClick(
      page,
      ".pv-top-card button.artdeco-dropdown__trigger:not(:disabled)",
      200
    );

    await timer(800);

    await this.moveMouseAndScroll(
      page,
      '.pv-top-card [aria-label="Connect"], .pv-top-card div.pv-s-profile-actions--connect, .pv-top-card [data-control-name="connect"], .pv-top-card [type="connect-icon"]',
      2000
    );

    await page.evaluate(() => {
      // @ts-ignore
      return (
        document
          .querySelector(
            '.pv-top-card [aria-label="Connect"], .pv-top-card div.pv-s-profile-actions--connect, .pv-top-card [data-control-name="connect"], .pv-top-card [type="connect-icon"]'
          )
          // @ts-ignore
          ?.click()
      );
    });
  }

  async connectMethod2(page: Page) {
    await this.moveAndClick(
      page,
      '.pv-top-card button.pv-s-profile-actions--connect:not(:disabled), [aria-label="Connect"], [data-control-name="connect"], .pvs-profile-actions__action:not(.artdeco-button--secondary):not([data-control-name="follow"]):not(.message-anywhere-button)'
    );
  }

  async connectMethod4(page: Page) {
    await this.moveAndClick(page, ".pv-top-card li-icon[type=connect] + span");
  }

  async connectMethod1(page: Page) {
    const button = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(".pvs-profile-actions button")
        // @ts-ignore
      )
        ?.find(
          (f) =>
            // @ts-ignore
            f?.innerText?.toLowerCase()?.indexOf("connect") > -1 ||
            // @ts-ignore
            f?.innerText?.toLowerCase()?.indexOf("conectar") > -1 ||
            // @ts-ignore
            f?.innerText?.toLowerCase()?.indexOf("collegati") > -1 ||
            // @ts-ignore
            f?.innerText?.toLowerCase()?.indexOf("se connecter") > -1 ||
            // @ts-ignore
            f?.innerText?.toLowerCase()?.indexOf("建立關係") > -1 ||
            // @ts-ignore
            f?.innerText?.toLowerCase()?.indexOf("kur") > -1 ||
            // @ts-ignore
            f?.innerText?.toLowerCase()?.indexOf("vernetzen") > -1
        )
        ?.getAttribute("id");
    });

    if (!button) {
      throw "";
    }

    await this.moveAndClick(page, `#${button}`);
  }

  async clickConnectButton(page: Page) {
    try {
      await this.connectMethod1(page);
    } catch (err) {
      try {
        await this.connectMethod3(page);
      } catch (err) {
        try {
          await this.connectMethod2(page);
        } catch (err) {
          await this.connectMethod4(page);
        }
      }
    }
  }
}
