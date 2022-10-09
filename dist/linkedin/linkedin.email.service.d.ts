import { LinkedinAbstractService } from './linkedin.abstract.service';
import { LinkedinServicesInterface } from './linkedin.services.interface';
import { CDPSession, Page } from 'puppeteer';
interface RequiredData {
    url: string;
}
export declare class LinkedinEmailService extends LinkedinAbstractService implements LinkedinServicesInterface<RequiredData> {
    process(page: Page, cdp: CDPSession, data: RequiredData): Promise<{
        url: string;
        linkedin_id: string;
        birthDay?: string;
        im?: {
            link: string;
            type: string;
        }[];
        twitter?: string;
        websites?: {
            link: string;
            type: string;
        }[];
        phone?: {
            phone: string;
            type: string;
        }[];
        email?: string;
    }>;
}
export {};
