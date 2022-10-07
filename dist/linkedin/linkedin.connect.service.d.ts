import { CombinedData, LinkedinServicesInterface } from "./linkedin.services.interface";
import { CDPSession, Page } from "puppeteer-core";
import { LinkedinAbstractService } from "./linkedin.abstract.service";
interface RequiredData {
    message: string;
    url: string;
    extra: {
        myname: string;
        mylastname: string;
        mycompany: string;
    };
}
export declare class LinkedinConnectService extends LinkedinAbstractService implements LinkedinServicesInterface<RequiredData> {
    process(page: Page, cdp: CDPSession, data: CombinedData<RequiredData>): Promise<{
        name: string;
        currentCompanyPicture: string;
        companyName: string;
        current_position_title: string;
        location: string;
        headline: string;
        current_position_length: string;
        url: string;
        linkedin_id: string;
    }>;
    connectMethod3(page: Page): Promise<void>;
    connectMethod2(page: Page): Promise<void>;
    connectMethod4(page: Page): Promise<void>;
    connectMethod1(page: Page): Promise<void>;
    clickConnectButton(page: Page): Promise<void>;
}
export {};
