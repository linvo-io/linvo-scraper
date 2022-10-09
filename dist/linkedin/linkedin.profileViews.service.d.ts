import { CDPSession, Page } from "puppeteer";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { LinkedinServicesInterface } from "./linkedin.services.interface";
interface RequiredData {
    viewer: Array<{
        name: string;
    }>;
}
export declare class LinkedinProfileViewsService extends LinkedinAbstractService implements LinkedinServicesInterface<RequiredData> {
    globalError(): {
        text: string;
    };
    process(page: Page, cdp: CDPSession): Promise<void>;
}
export {};
