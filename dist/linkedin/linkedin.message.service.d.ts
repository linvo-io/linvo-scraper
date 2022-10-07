import { CombinedData, LinkedinServicesInterface } from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
interface RequiredData {
    name: string;
    info?: any;
    contact?: any;
    message: string;
    url: string;
    IgnoreProspectMessages: 0 | 1 | 2;
    image?: {
        todo: "gif" | "upload" | "personalized";
        value: {
            picture: string;
            id: string | number;
        };
    };
}
export interface Message {
    from: "Prospect" | "Me";
    message: string;
    sentiment: number;
}
export declare class LinkedinMessageService extends LinkedinAbstractService implements LinkedinServicesInterface<RequiredData> {
    findInChat(page: Page, name: string): Promise<string>;
    process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>): Promise<{
        info: any;
        messages: {
            name: string;
            time: string;
            values: Message[];
        };
        name: string[];
    }>;
    getMessagesList(page: Page, lastName: string): Promise<{
        name: string;
        time: string;
        values: Message[];
    }>;
}
export {};
