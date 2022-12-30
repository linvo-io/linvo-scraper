import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { Page } from "puppeteer";
import {
  LinkedinServicesInterface,
} from "./linkedin.services.interface";
import { CDPSession } from "puppeteer";
import { LinkedinSalesPageService } from "./linkedin.sales.page.service";
import { LinkedinPageService } from "./linkedin.page.service";
import { parse, stringify } from "querystring";

export interface PageConnections {
  name: string;
  link: string;
  image: string;
  description: string;
  connect: boolean;
}

interface RequiredData {
  page: number;
  url: string;
  remove_overlapping: boolean;
}

const normalPage = new LinkedinPageService();
const salesPage = new LinkedinSalesPageService();

export class LinkedinGlobalPageService
  extends LinkedinAbstractService
  implements LinkedinServicesInterface<RequiredData>
{
  async process(page: Page, cdp: CDPSession, data: RequiredData) {
    const load = await this.startProcess(page, cdp, data);
    return { ...load, url: data.url };
  }

  async startProcess(
    page: Page,
    cdp: CDPSession,
    data: RequiredData
  ): Promise<{
    pages: number;
    remove_overlapping?: boolean;
    values: PageConnections[];
    csv?: string;
  }> {
    const { page: pageNumber, url, remove_overlapping } = data;
    if (pageNumber > 100) {
      return {
        values: [],
        pages: 0,
      };
    }

    const onlyQuery = new URL(url.replace("#", "?"));
    const parseQuery = parse(onlyQuery.search);

    if (
      url.indexOf(
        "https://linvo-premium-dev-bucket.s3.us-east-2.amazonaws.com"
      ) === 0 &&
      // @ts-ignore
      parseQuery.run === false
    ) {
      return {
        values: [],
        pages: 0,
      };
    }

    if (
      url.indexOf(
        "https://linvo-premium-dev-bucket.s3.us-east-2.amazonaws.com"
      ) === 0
    ) {
      return {
        values: [],
        pages: 1,
        csv: url,
        remove_overlapping,
      };
    }

    if (pageNumber === 1) {
      // @ts-ignore
      delete parseQuery.page;
    } else {
      // @ts-ignore
      parseQuery.page = pageNumber;
    }

    // @ts-ignore
    if (parseQuery?.viewAllFilters) {
      // @ts-ignore
      parseQuery?.viewAllFilters = "false";
    }

    const newUrl = onlyQuery.origin +
        onlyQuery.pathname +
        (url.indexOf("#") > -1 ? "#" : "?") + stringify(parseQuery).replace('%3F', '');
    const info = await (url.indexOf("/sales/") > -1
      ? salesPage
      : normalPage
    ).pagesTask(page, newUrl);

    // @ts-ignore
    return {
      ...info,
      remove_overlapping,
    };

    return Promise.race([
      (url.indexOf("/sales/") > -1 ? salesPage : normalPage).pagesTask(
        page,
        newUrl
      ),
      new Promise(async (res) => {
        try {
          await page.waitForFunction(
            () => {
              return (
                document?.body?.innerText?.trim()?.indexOf("No results found") >
                  -1 ||
                document?.body?.innerText
                  ?.trim()
                  ?.indexOf(
                    "no results containing your search terms were found"
                  ) > -1
              );
            },
            {
              timeout: 0,
            }
          );

          res({
            values: [],
            pages: 0,
          });
        } catch (err) {
          return;
        }
      }),
    ]) as any;
  }
}
