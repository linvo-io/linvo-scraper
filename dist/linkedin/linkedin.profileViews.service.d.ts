import { CDPSession, Page } from "puppeteer";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { LinkedinServicesInterface } from "./linkedin.services.interface";
export interface People {
    name: {
        firstName: String;
        lastName: String;
    };
    profilePicture?: String;
    count?: String;
}
export declare class LinkedinProfileViewsService extends LinkedinAbstractService implements LinkedinServicesInterface<{}> {
    globalError(): {
        text: string;
    };
    process(page: Page, cdp: CDPSession): Promise<Array<People>>;
}
