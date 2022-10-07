import { Page } from "puppeteer-core";
import { MessagesService } from "../helpers/messages.service";
export declare class LinkedinAbstractService extends MessagesService {
    extractEmail(page: Page): Promise<{
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
    moveMouseAndScroll(page: Page, selector: string, timeout?: number, disabledMouseMove?: boolean, offset?: number): Promise<void>;
    static checkLimit(page: Page): Promise<void>;
    static checkToken(page: Page): Promise<void>;
    extractInformation(page: Page): Promise<{
        currentTitle: string;
        currentPositionLength: string;
        headline: string;
        location: string;
        profilePicture: string;
        name: string;
        last_name: string;
        companyName: string;
        currentCompanyPicture: string;
    }>;
    moveAndClick(page: Page, select: string | {
        container: string;
        selector: string;
    }, timeout?: number, totalClicks?: number): Promise<void | import("puppeteer-core").ElementHandle<Element>>;
    generateMessage(message: string, params: {
        firstName: string;
        lastName: string;
        companyName: string;
        profilePicture: string;
        myname: string;
        mylastname: string;
        mycompany: string;
    }): Promise<string>;
    waitForLoader(page: Page): Promise<void>;
    selectContract(page: Page): Promise<void>;
    waitForSalesLoader(page: Page): Promise<void>;
}
