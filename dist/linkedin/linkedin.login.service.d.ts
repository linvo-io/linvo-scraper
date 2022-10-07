import { CombinedData, LinkedinServicesInterface } from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
interface RequiredData {
    user: string;
    password: string;
}
export declare class LinkedinLoginService extends LinkedinAbstractService implements LinkedinServicesInterface<RequiredData> {
    process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>): Promise<{
        user: string;
        token: string;
    }>;
}
export {};
