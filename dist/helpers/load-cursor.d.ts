import { Page } from "puppeteer-core";
declare const loadCursor: (page: Page, headless: boolean) => Promise<void>;
export default loadCursor;
