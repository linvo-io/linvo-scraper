import { CDPSession, Page } from "puppeteer";
export interface LinkedinServicesInterface<T> {
    process: (page: Page, cdp: CDPSession, data: T) => Promise<any>;
}
