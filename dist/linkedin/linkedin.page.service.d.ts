import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { Page } from "puppeteer";
export declare class LinkedinPageService extends LinkedinAbstractService {
    elements(page: Page, index: number): Promise<any>;
    pagesTask(page: Page, url: string): Promise<{
        pages: number;
        values: any;
    }>;
}
