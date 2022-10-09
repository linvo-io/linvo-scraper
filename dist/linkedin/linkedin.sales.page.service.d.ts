import { Page } from "puppeteer";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
export declare class LinkedinSalesPageService extends LinkedinAbstractService {
    salesNavChooser(page: Page): Promise<void>;
    pagesTask(page: Page, url: string): Promise<{
        pages: number;
        values: any;
    }>;
    scrollTo(page: Page, scrollName: string, time?: number): Promise<any>;
    workOnResults(page: Page): Promise<any[]>;
}
