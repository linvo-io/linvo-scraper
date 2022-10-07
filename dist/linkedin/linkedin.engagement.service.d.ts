import { CombinedData, LinkedinServicesInterface } from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
export declare class LinkedinEngagementService extends LinkedinAbstractService implements LinkedinServicesInterface<any> {
    process(page: Page, cdp: CDPSession, data: CombinedData<any>): Promise<void>;
}
