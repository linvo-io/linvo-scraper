import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { CombinedData, LinkedinServicesInterface } from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
interface RequiredData {
    url: string;
    message: string;
    contact: any;
    IgnoreProspectMessages: 1 | 2 | 0;
    extra: {
        myname: string;
        mylastname: string;
        mycompany: string;
    };
    image?: {
        todo: "gif" | "upload" | "personalized";
        value: {
            picture: string;
            id: string | number;
        };
    };
}
export declare class LinkedinMessageWithView extends LinkedinAbstractService implements LinkedinServicesInterface<RequiredData> {
    process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>): Promise<{
        info: any;
        messages: {
            name: string;
            time: string;
            values: import("./linkedin.message.service").Message[];
        };
        name: string[];
    }>;
}
export {};
