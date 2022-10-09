import { LinkedinAbstractService } from "./linkedin.abstract.service";
import { Page } from "puppeteer";
import { Message } from "./linkedin.message.service";
import { LinkedinServicesInterface } from "./linkedin.services.interface";
export declare class LinkedinMessagesFromChat extends LinkedinAbstractService implements LinkedinServicesInterface<any> {
    process(page: Page): Promise<any>;
    getMessagesList(page: Page, lastName: string): Promise<{
        id: string;
        name: string;
        time: string;
        img: string;
        link: string;
        values: Message[];
    }>;
    nextPerson(page: Page, idList: string[], name: string, language: string): Promise<any>;
    totalVisibleElement(page: Page): Promise<number>;
    continueGetAllMessagesFromChat(page: Page): Promise<any>;
}
