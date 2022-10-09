import { LinkedinServicesInterface } from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
interface RequiredData {
    messages: Array<{
        id: string;
        name: string;
        messages: string;
        link: string;
    }>;
}
export declare class LinkedinMessagesService extends LinkedinAbstractService implements LinkedinServicesInterface<RequiredData> {
    process(page: Page, cdp: CDPSession, data: RequiredData): Promise<any>;
}
export {};
