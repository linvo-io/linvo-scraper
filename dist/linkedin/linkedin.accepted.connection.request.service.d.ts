import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { Page } from "puppeteer";
import { LinkedinServicesInterface } from "./linkedin.services.interface";
export declare class LinkedinAcceptedConnectionsService extends LinkedinAbstractService implements LinkedinServicesInterface<any> {
    process(page: Page): Promise<any>;
    scrapeProfile(page: Page): Promise<Array<{
        name: string;
        url: string;
    }>>;
}
