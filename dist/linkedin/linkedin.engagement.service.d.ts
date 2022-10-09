import { LinkedinServicesInterface } from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
export declare class LinkedinEngagementService extends LinkedinAbstractService implements LinkedinServicesInterface<any> {
    process(page: Page, cdp: CDPSession, data: any): Promise<void>;
}
