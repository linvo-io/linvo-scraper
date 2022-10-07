import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { Page } from "puppeteer-core";
export declare class LinkedinPageService extends LinkedinAbstractService {
    globalError(): {
        text: string;
    };
    elements(page: Page, index: number): Promise<any>;
    pagesTask(page: Page, url: string): Promise<{
        pages: number;
        values: any;
    }>;
}
