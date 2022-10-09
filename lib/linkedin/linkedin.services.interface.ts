import { CDPSession, Page } from "puppeteer";

export interface LinkedinServicesInterface<T> {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  process: (page: Page, cdp: CDPSession, data?: T) => Promise<any>;
}
