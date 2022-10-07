import { CombinedData, LinkedinServicesInterface } from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
interface RequiredData {
    messages: Array<{
        id: string;
        name: string;
        messages: string;
        link: string;
    }>;
}
export interface Message {
    from: "Prospect" | "Me";
    message: string;
    sentiment: number;
}
export declare class LinkedinMessagesService extends LinkedinAbstractService implements LinkedinServicesInterface<RequiredData> {
    process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>): Promise<any>;
}
export {};
