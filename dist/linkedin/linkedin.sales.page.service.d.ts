import { Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
export declare class LinkedinSalesPageService extends LinkedinAbstractService {
    globalError(): {
        text: string;
    };
    salesNavChooser(page: Page): Promise<void>;
    pagesTask(page: Page, url: string): Promise<{
        pages: number;
        values: any;
    }>;
    scrollTo(page: Page, scrollName: string, time?: number): Promise<any>;
    workOnResults(page: Page): Promise<any[]>;
}
